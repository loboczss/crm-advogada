import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useRequestFetch } from '#imports'

interface SendResult {
    success: boolean
    chunks: number
    markdownPreview: string
}

export const useEvaRagStore = defineStore('evaRag', () => {
    const loading = ref(false)
    const error = ref<string | null>(null)
    const lastResult = ref<SendResult | null>(null)

    /**
     * Send a document through the full RAG pipeline:
     * parse → GPT markdown → informacoes_adicional_rag → vector store
     */
    async function sendDocument(payload: {
        conteudo: string
        base64?: string
        tipo: string
    }): Promise<SendResult> {
        loading.value = true
        error.value = null
        lastResult.value = null

        try {
            const fetch = useRequestFetch()
            const result = await fetch<SendResult>('/api/eva/rag', {
                method: 'POST',
                body: payload,
            })
            lastResult.value = result
            return result
        } catch (e: any) {
            error.value = e.data?.statusMessage || e.message || 'Erro ao processar documento.'
            throw e
        } finally {
            loading.value = false
        }
    }

    function reset() {
        loading.value = false
        error.value = null
        lastResult.value = null
    }

    return { loading, error, lastResult, sendDocument, reset }
})
