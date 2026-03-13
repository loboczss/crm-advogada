import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useRequestFetch } from '#imports'
import type { CrmEvasturDTO } from '../../shared/types/CrmEvasturDTO'

interface CrmResponse {
    records: CrmEvasturDTO[]
    total: number
    page: number
    pageSize: number
}

interface CrmStats {
    totalLeads: number
    highUrgency: number
    sentiment: number
    conversionRate: number
}

export const useCrmEvasturStore = defineStore('crmEvastur', () => {
    // ─── State ────────────────────────────────────────────────────────────────
    const records = ref<CrmEvasturDTO[]>([])
    const total = ref(0)
    const loading = ref(false)
    const saving = ref(false)
    const deleting = ref<number | null>(null)
    const error = ref<string | null>(null)

    const currentPage = ref(1)
    const pageSize = ref(25)
    const search = ref('')

    const stats = ref<CrmStats>({
        totalLeads: 0,
        highUrgency: 0,
        sentiment: 0,
        conversionRate: 0
    })
    const statsLoading = ref(false)

    // ─── Computed ─────────────────────────────────────────────────────────────
    const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

    // ─── Actions ──────────────────────────────────────────────────────────────
    async function fetchRecords() {
        loading.value = true
        error.value = null
        try {
            const fetch = useRequestFetch()
            const params = new URLSearchParams()
            params.set('page', String(currentPage.value))
            params.set('pageSize', String(pageSize.value))
            if (search.value) params.set('search', search.value)

            const res = await fetch<CrmResponse>(`/api/crm/evastur?${params.toString()}`)
            records.value = res.records
            total.value = res.total
        } catch (e: any) {
            error.value = e.data?.message || e.message || 'Erro ao carregar leads.'
        } finally {
            loading.value = false
        }
    }

    async function fetchStats() {
        statsLoading.value = true
        try {
            const fetch = useRequestFetch()
            const res = await fetch<CrmStats>('/api/crm/evastur/stats')
            stats.value = res
        } catch (e: any) {
            console.error('Erro ao carregar stats do CRM:', e)
        } finally {
            statsLoading.value = false
        }
    }

    async function addRecord(payload: Omit<CrmEvasturDTO, 'id' | 'created_at'>) {
        saving.value = true
        error.value = null

        // Optimistic add with a temporary negative id
        const tempId = -Date.now()
        const optimisticRecord: CrmEvasturDTO = { ...payload, id: tempId, created_at: new Date().toISOString() }
        records.value.unshift(optimisticRecord)
        total.value++

        try {
            const fetch = useRequestFetch()
            const created = await fetch<CrmEvasturDTO>('/api/crm/evastur', { method: 'POST', body: payload })
            // Replace temp record with the real one from server
            const idx = records.value.findIndex(r => r.id === tempId)
            if (idx !== -1) records.value[idx] = created
            // Refresh stats in background — don't block the UI
            fetchStats().catch(() => {})
        } catch (e: any) {
            // Revert optimistic change
            records.value = records.value.filter(r => r.id !== tempId)
            total.value--
            error.value = e.data?.message || e.message || 'Erro ao criar lead.'
            throw e
        } finally {
            saving.value = false
        }
    }

    async function updateRecord(id: number, payload: Partial<CrmEvasturDTO>) {
        saving.value = true
        error.value = null

        // Optimistic update
        const idx = records.value.findIndex(r => r.id === id)
        const oldRecord = idx !== -1 ? { ...records.value[idx] } : null
        if (idx !== -1) records.value[idx] = { ...records.value[idx], ...payload }

        try {
            const fetch = useRequestFetch()
            const updated = await fetch<CrmEvasturDTO>(`/api/crm/evastur/${id}`, { method: 'PUT', body: payload })
            // Sync with server response
            if (idx !== -1) records.value[idx] = updated
            fetchStats().catch(() => {})
        } catch (e: any) {
            // Revert to old value
            if (idx !== -1 && oldRecord) records.value[idx] = oldRecord
            error.value = e.data?.message || e.message || 'Erro ao atualizar lead.'
            throw e
        } finally {
            saving.value = false
        }
    }

    async function deleteRecord(id: number) {
        deleting.value = id
        error.value = null

        // Optimistic delete
        const idx = records.value.findIndex(r => r.id === id)
        const deletedRecord = idx !== -1 ? records.value[idx] : null
        if (idx !== -1) records.value.splice(idx, 1)
        total.value = Math.max(0, total.value - 1)

        try {
            const fetch = useRequestFetch()
            await fetch(`/api/crm/evastur/${id}`, { method: 'DELETE' })
            fetchStats().catch(() => {})
        } catch (e: any) {
            // Revert: re-insert at original position
            if (idx !== -1 && deletedRecord) records.value.splice(idx, 0, deletedRecord)
            total.value++
            error.value = e.data?.message || e.message || 'Erro ao excluir lead.'
            throw e
        } finally {
            deleting.value = null
        }
    }

    function setSearch(query: string) {
        search.value = query
        currentPage.value = 1
        fetchRecords()
    }

    async function goToPage(page: number) {
        if (page < 1 || page > totalPages.value) return
        currentPage.value = page
        await fetchRecords()
    }

    return {
        records, total, loading, saving, deleting, error,
        currentPage, pageSize, totalPages, search,
        stats, statsLoading,
        fetchRecords, fetchStats, addRecord, updateRecord, deleteRecord, setSearch, goToPage
    }
})
