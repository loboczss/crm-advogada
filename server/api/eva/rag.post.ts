import OpenAI from 'openai'
import { serverSupabaseServiceRole } from '#supabase/server'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

// Use node: prefix so Rollup/esbuild always treat these as Node built-ins.
// pathToFileURL(cwd) avoids Windows drive-letter issues with import.meta.url.
const _require = createRequire(pathToFileURL(process.cwd() + '/').href)


interface RagBody {
    conteudo: string
    base64?: string
    tipo: string
}

// Helper to split text mimicking LangChain's RecursiveCharacterTextSplitter
function splitText(text: string, chunkSize = 1200, chunkOverlap = 100): string[] {
    const separators = ['\n\n', '\n', ' ', '']
    
    function split(text: string, separatorIndex: number): string[] {
        if (separatorIndex >= separators.length) return [text]
        const separator = separators[separatorIndex] || ''
        
        let splits
        if (separator === '') {
            splits = text.split('')
        } else {
            splits = text.split(separator)
        }
        
        const chunks: string[] = []
        let currentChunk = ''
        
        for (const split of splits) {
            const potentialChunk = currentChunk ? currentChunk + separator + split : split
            
            if (potentialChunk.length <= chunkSize) {
                currentChunk = potentialChunk
            } else {
                if (currentChunk) chunks.push(currentChunk)
                currentChunk = split
                
                // If the single split is STILL larger than chunkSize, we must recurse on it
                if (currentChunk.length > chunkSize) {
                    const subChunks = splitText(currentChunk, chunkSize, chunkOverlap)
                    chunks.push(...subChunks)
                    currentChunk = ''
                }
            }
        }
        if (currentChunk) chunks.push(currentChunk)
        return chunks
    }

    const initialChunks = split(text, 0)
    
    // Apply overlap simply
    if (chunkOverlap === 0) return initialChunks
    
    const overlappedChunks: string[] = []
    for (let i = 0; i < initialChunks.length; i++) {
        let chunk = initialChunks[i] || ''
        // Add overlap from next chunk if possible
        if (i < initialChunks.length - 1 && chunk.length < chunkSize) {
            const nextChunk = initialChunks[i + 1] || ''
            const spaceLeft = chunkSize - chunk.length
            const overlapAmount = Math.min(chunkOverlap, spaceLeft)
            chunk += '\n' + nextChunk.slice(0, overlapAmount)
        }
        if (chunk.trim()) {
            overlappedChunks.push(chunk.trim())
        }
    }
    
    return overlappedChunks.filter(Boolean)
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const apiKey = config.openaiApiKey as string

    if (!apiKey) {
        throw createError({ statusCode: 500, statusMessage: 'OPENAI_API_KEY não configurada.' })
    }

    const body = await readBody<RagBody>(event)

    if (!body?.tipo) {
        throw createError({ statusCode: 400, statusMessage: 'Campo "tipo" é obrigatório.' })
    }

    const openai = new OpenAI({ apiKey })
    const supabase = serverSupabaseServiceRole(event)
    const tipo = body.tipo.toUpperCase()

    // ─── STEP 1: Extract raw text from the document ──────────────────────────
    let rawText = ''

    if (!body.base64 || tipo === 'TXT') {
        // Plain text — use conteudo directly
        rawText = body.conteudo ?? ''
    } else {
        const buffer = Buffer.from(body.base64, 'base64')

        if (tipo === 'PDF') {
            // Lazy-load pdf-parse at request time (not module init) to avoid Nitro/Windows ESM issue
            const pdfParse = _require('pdf-parse') as (b: Buffer) => Promise<{ text: string }>
            const parsed = await pdfParse(buffer)
            rawText = parsed.text
        } else if (['XLSX', 'XLS', 'CSV'].includes(tipo)) {
            // Use _require (CJS) instead of dynamic ESM import to avoid Windows path issues
            const XLSX = _require('xlsx') as typeof import('xlsx')
            const workbook = XLSX.read(buffer, { type: 'buffer' })
            const sheetTexts: string[] = []
            for (const sheetName of workbook.SheetNames) {
                const ws = workbook.Sheets[sheetName]
                if (!ws) continue
                const csv = XLSX.utils.sheet_to_csv(ws)
                sheetTexts.push(`## ${sheetName}\n${csv}`)
            }
            rawText = sheetTexts.join('\n\n')
        } else {
            // Fallback: treat as text
            rawText = buffer.toString('utf-8')
        }
    }

    if (!rawText.trim()) {
        throw createError({ statusCode: 400, statusMessage: 'Não foi possível extrair texto do documento.' })
    }

    // ─── STEP 2: Convert to Markdown with GPT ────────────────────────────────
    const gptResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: 'Você é um assistente especializado em conversão de dados para Markdown estruturado. Converta o texto fornecido para Markdown limpo e bem formatado, sem adicionar informações extras. Responda APENAS com o Markdown convertido.'
            },
            {
                role: 'user',
                content: rawText.slice(0, 12000) // GPT input limit safety
            }
        ],
        temperature: 0.2,
    })

    const markdownContent = gptResponse.choices[0]?.message?.content ?? rawText

    // ─── STEP 3: Save markdown to informacoes_adicional_rag ──────────────────
    const { error: ragError } = await supabase
        .from('informacoes_adicional_rag')
        .insert({
            content: markdownContent,
            source: body.conteudo?.slice(0, 100) || `upload-${tipo}`,
            tipo,
        })

    if (ragError) {
        throw createError({ statusCode: 500, statusMessage: `Erro ao salvar no RAG: ${ragError.message}` })
    }

    // ─── STEP 4: Generate embeddings and save to documents (vector store) ────
    const chunks = splitText(markdownContent, 1200, 100)

    if (chunks.length === 0) {
        return {
            success: true,
            chunks: 0,
            markdownPreview: 'Nenhum texto contínuo extraído.',
        }
    }

    // Generate embeddings for all chunks in batch
    // Changed to text-embedding-3-small based on user feedback
    const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunks,
    })

    const inserts = chunks.map((chunk, i) => {
        return {
            content: chunk,
            embedding: embeddingResponse.data[i]?.embedding ?? [],
            metadata: {
                source: body.conteudo?.slice(0, 50) || `upload-${tipo}`,
                tipo: tipo,
                chunk_index: i + 1,
                total_chunks: chunks.length
            },
        }
    })

    const { error: vecError } = await supabase
        .from('documents')
        .insert(inserts)

    if (vecError) {
        throw createError({ statusCode: 500, statusMessage: `Erro ao salvar no vector store: ${vecError.message}` })
    }

    return {
        success: true,
        chunks: chunks.length,
        markdownPreview: markdownContent.slice(0, 300),
    }
})
