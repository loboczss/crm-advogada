import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useRequestFetch, useRequestHeaders } from '#imports'
import type { EvaSystemPrompt } from '../../shared/types/EvaSystemPromptDTO'

export const useEvaPromptStore = defineStore('evaPrompt', () => {
    // ─── State ────────────────────────────────────────────────────────────────
    const content = ref('')
    const loading = ref(false)
    const saving = ref(false)
    const error = ref<string | null>(null)
    const lastUpdated = ref<string | null>(null)

    // ─── Actions ──────────────────────────────────────────────────────────────
    async function fetchPrompt() {
        loading.value = true
        error.value = null
        try {
            const fetch = useRequestFetch()
            const data = await fetch<EvaSystemPrompt>('/api/eva/prompt')
            content.value = data.content
            lastUpdated.value = data.updated_at
        } catch (e: any) {
            error.value = e.data?.statusMessage || e.message || 'Erro ao carregar prompt.'
        } finally {
            loading.value = false
        }
    }

    async function savePrompt(newContent: string) {
        saving.value = true
        error.value = null
        try {
            const fetch = useRequestFetch()
            const data = await fetch<EvaSystemPrompt>('/api/eva/prompt', {
                method: 'PUT',
                body: { content: newContent },
            })
            content.value = data.content
            lastUpdated.value = data.updated_at
        } catch (e: any) {
            error.value = e.data?.statusMessage || e.message || 'Erro ao salvar prompt.'
            throw e
        } finally {
            saving.value = false
        }
    }

    return {
        content,
        loading,
        saving,
        error,
        lastUpdated,
        fetchPrompt,
        savePrompt,
    }
})
