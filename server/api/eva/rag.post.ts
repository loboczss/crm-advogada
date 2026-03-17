import OpenAI from 'openai'
import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import { createRequire } from 'node:module'
import { randomUUID } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { createJob, completeJob, failJob } from '../../utils/ragJobStore'
import type { SupabaseClient } from '@supabase/supabase-js'
import { assertActorRole, throwSanitizedInternalError } from '../../utils/security'

// Use node: prefix so Rollup/esbuild always treat these as Node built-ins.
// pathToFileURL(cwd) avoids Windows drive-letter issues with import.meta.url.
const _require = createRequire(pathToFileURL(process.cwd() + '/').href)


interface RagBody {
    conteudo: string
    base64?: string
    tipo: string
}

const METADATA_CONTENT_LIMIT = 8000
const METADATA_PREVIEW_LIMIT = 280

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

    if (chunkOverlap === 0) return initialChunks

    const overlappedChunks: string[] = []
    for (let i = 0; i < initialChunks.length; i++) {
        let chunk = initialChunks[i] || ''
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

// ─── Background Processing ────────────────────────────────────────────────────
// Runs after the HTTP response is sent. Handles the slow GPT + embedding calls.
async function processInBackground(
    openai: OpenAI,
    supabase: SupabaseClient,
    body: RagBody,
    tipo: string,
    documentGroupId: string,
    rawText: string,
): Promise<void> {
    try {
        const originalContentPreview = rawText.slice(0, METADATA_CONTENT_LIMIT)
        const originalSearchPreview = rawText.slice(0, METADATA_PREVIEW_LIMIT)

        // ─── STEP 2: Convert to Markdown with GPT ────────────────────────────
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
        const markdownContentPreview = markdownContent.slice(0, METADATA_CONTENT_LIMIT)
        const markdownSearchPreview = markdownContent.slice(0, METADATA_PREVIEW_LIMIT)

        // ─── STEP 3: Save markdown to informacoes_adicional_rag ──────────────
        const { data: ragRow, error: ragError } = await supabase
            .from('informacoes_adicional_rag')
            .insert({
                content: markdownContent,
                source: body.conteudo?.slice(0, 100) || `upload-${tipo}`,
                tipo,
            })
            .select('id')
            .single()

        if (ragError) {
            console.error('[eva/rag] Erro ao salvar em informacoes_adicional_rag:', ragError)
            failJob(documentGroupId, 'Erro ao salvar documento no RAG.')
            return
        }

        // ─── STEP 4: Generate embeddings and save to documents (vector store) ─
        const chunks = splitText(markdownContent, 1200, 100)

        if (chunks.length === 0) {
            completeJob(documentGroupId, { chunks: 0, markdownPreview: 'Nenhum texto contínuo extraído.' })
            return
        }

        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: chunks,
        })

        const inserts = chunks.map((chunk, i) => ({
            content: chunk,
            embedding: embeddingResponse.data[i]?.embedding ?? [],
            metadata: {
                source: body.conteudo?.slice(0, 50) || `upload-${tipo}`,
                tipo,
                chunk_index: i + 1,
                total_chunks: chunks.length,
                document_group_id: documentGroupId,
                originalPreview: originalSearchPreview,
                markdownPreview: markdownSearchPreview,
                ...(i === 0 ? { originalContent: originalContentPreview, markdownContent: markdownContentPreview } : {}),
            },
        }))

        const { error: vecError } = await supabase.from('documents').insert(inserts)

        if (vecError) {
            // Rollback: remove the orphaned RAG record to keep data consistent
            console.error('[eva/rag] Erro ao salvar no vector store, revertendo registro RAG:', vecError)
            await supabase.from('informacoes_adicional_rag').delete().eq('id', ragRow.id)
            failJob(documentGroupId, 'Erro ao salvar embeddings.')
            return
        }

        completeJob(documentGroupId, { chunks: chunks.length, markdownPreview: markdownContent.slice(0, 300) })
    } catch (err: any) {
        console.error('[eva/rag] Erro inesperado no processamento em background:', err)
        failJob(documentGroupId, 'Erro inesperado no processamento.')
    }
}

// ─── Request Handler ──────────────────────────────────────────────────────────
const ALLOWED_TIPOS = ['PDF', 'XLSX', 'XLS', 'CSV', 'TXT']

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user?.sub) throw createError({ statusCode: 401, message: 'Não autorizado.' })

    await assertActorRole(event, user.sub, ['admin', 'vendedor'], 'Apenas administradores ou vendedores podem editar a EVA.', 'eva/rag:create')

    const config = useRuntimeConfig()
    const apiKey = config.openaiApiKey as string

    if (!apiKey) {
        throw createError({ statusCode: 500, message: 'Serviço de IA indisponível no momento.' })
    }

    const body = await readBody<RagBody>(event)

    if (!body?.tipo) {
        throw createError({ statusCode: 400, message: 'Campo "tipo" é obrigatório.' })
    }

    if (!ALLOWED_TIPOS.includes(body.tipo.toUpperCase())) {
        throw createError({ statusCode: 400, message: `Tipo "${body.tipo}" não suportado. Use: ${ALLOWED_TIPOS.join(', ')}.` })
    }

    const tipo = body.tipo.toUpperCase()
    const documentGroupId = randomUUID()

    // ─── STEP 1: Extract raw text (fast — buffer already in memory) ──────────
    let rawText = ''

    if (!body.base64 || tipo === 'TXT') {
        rawText = body.conteudo ?? ''
    } else {
        const buffer = Buffer.from(body.base64, 'base64')

        if (tipo === 'PDF') {
            const pdfParse = _require('pdf-parse') as (b: Buffer) => Promise<{ text: string }>
            const parsed = await pdfParse(buffer)
            rawText = parsed.text
        } else if (['XLSX', 'XLS', 'CSV'].includes(tipo)) {
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
            rawText = buffer.toString('utf-8')
        }
    }

    if (!rawText.trim()) {
        throw createError({ statusCode: 400, message: 'Não foi possível extrair texto do documento.' })
    }

    // ─── Kick off background processing and return immediately ───────────────
    const openai = new OpenAI({ apiKey })
    const supabase = serverSupabaseServiceRole(event)

    createJob(documentGroupId, user.sub)

    // Fire-and-forget: GPT conversion + embeddings + DB inserts run after response
    processInBackground(openai, supabase, body, tipo, documentGroupId, rawText).catch(() => {})

    setResponseStatus(event, 202)
    return { success: true, jobId: documentGroupId, status: 'processing' }
})
