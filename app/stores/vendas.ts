import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useRequestFetch } from '#imports'
import type { Venda } from '../../shared/types/VendaDTO'
import type { SalesFilterParams } from '../components/sales/SalesFilters.vue'

interface VendasResponse {
    vendas: Venda[]
    total: number
    page: number
    pageSize: number
}

interface MaiorVenda {
    id: number
    contact_name: string | null
    contato_id: string
    valor_venda: number | null
}

interface StatsResponse {
    total: number
    valorTotal: number
    ticketMedio: number
    maiorVenda: MaiorVenda | null
}

export const useVendasStore = defineStore('vendas', () => {
    // ─── State ────────────────────────────────────────────────────────────────
    const vendas = ref<Venda[]>([])
    const total = ref(0)
    const loading = ref(false)
    const saving = ref(false)
    const deleting = ref<number | null>(null)
    const error = ref<string | null>(null)
    const activeFilters = ref<SalesFilterParams>({})
    const columnFilters = ref<Record<string, string>>({})


    // Sorting state
    const sortBy = ref('created_at')
    const sortOrder = ref<'asc' | 'desc'>('desc')


    // Pagination state
    const currentPage = ref(1)
    const pageSize = ref(25)

    // Stats from server (accurate across all records)
    const statsTotal = ref(0)
    const statsValorTotal = ref(0)
    const statsTicketMedio = ref(0)
    const statsMaiorVenda = ref<MaiorVenda | null>(null)
    const statsLoading = ref(false)

    // Modal state
    const selectedVenda = ref<Venda | null>(null)
    const isDetailModalOpen = ref(false)


    // ─── Computed ─────────────────────────────────────────────────────────────
    const totalVendas = computed(() => statsTotal.value || total.value)
    const valorTotal = computed(() => statsValorTotal.value)
    const ticketMedio = computed(() => statsTicketMedio.value)
    const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

    // ─── Helpers ──────────────────────────────────────────────────────────────
    function buildQueryString(filters: SalesFilterParams, page: number = currentPage.value): string {
        const params = new URLSearchParams()
        if (filters.startDate) params.set('startDate', filters.startDate)
        if (filters.endDate) params.set('endDate', filters.endDate)
        if (filters.search) params.set('search', filters.search)
        if (filters.valorMin != null) params.set('valorMin', String(filters.valorMin))
        if (filters.valorMax != null) params.set('valorMax', String(filters.valorMax))
        if (filters.valorAprox != null) params.set('valorAprox', String(filters.valorAprox))
        if (filters.valorExato != null) params.set('valorExato', String(filters.valorExato))

        // Add column filters
        Object.entries(columnFilters.value).forEach(([key, value]) => {
            if (value) params.set(`filter_${key}`, value)
        })

        params.set('page', String(page))
        params.set('pageSize', String(pageSize.value))
        params.set('sortBy', sortBy.value)
        params.set('sortOrder', sortOrder.value)
        return params.toString()
    }


    // ─── Actions ──────────────────────────────────────────────────────────────
    async function fetchVendas(filters: SalesFilterParams = activeFilters.value, page: number = currentPage.value) {
        activeFilters.value = filters
        currentPage.value = page
        loading.value = true
        error.value = null
        try {
            const fetch = useRequestFetch()
            const qs = buildQueryString(filters, page)
            const res = await fetch<VendasResponse>(`/api/vendas?${qs}`)
            vendas.value = res.vendas
            total.value = res.total
        } catch (e: any) {
            error.value = e.data?.statusMessage || e.message || 'Erro ao carregar vendas.'
        } finally {
            loading.value = false
        }
    }

    async function fetchStats(filters: SalesFilterParams = activeFilters.value) {
        statsLoading.value = true
        try {
            const fetch = useRequestFetch()
            const params = new URLSearchParams()
            if (filters.startDate) params.set('startDate', filters.startDate)
            if (filters.endDate) params.set('endDate', filters.endDate)
            if (filters.search) params.set('search', filters.search)
            if (filters.valorMin != null) params.set('valorMin', String(filters.valorMin))
            if (filters.valorMax != null) params.set('valorMax', String(filters.valorMax))
            if (filters.valorExato != null) params.set('valorExato', String(filters.valorExato))
            if (filters.valorAprox != null) params.set('valorAprox', String(filters.valorAprox))
            const qs = params.toString()
            const res = await fetch<StatsResponse>(`/api/vendas/stats${qs ? '?' + qs : ''}`)
            statsTotal.value = res.total
            statsValorTotal.value = res.valorTotal
            statsTicketMedio.value = res.ticketMedio
            statsMaiorVenda.value = res.maiorVenda
        } catch (e: any) {
            error.value = e.data?.statusMessage || e.message || 'Erro ao carregar estatísticas.'
        } finally {
            statsLoading.value = false
        }
    }

    async function goToPage(page: number) {
        if (page < 1 || page > totalPages.value) return
        await fetchVendas(activeFilters.value, page)
    }

    async function applyFilters(filters: SalesFilterParams) {
        currentPage.value = 1
        await Promise.all([fetchVendas(filters, 1), fetchStats(filters)])
    }

    async function addVenda(payload: Omit<Venda, 'id' | 'created_at'>) {
        saving.value = true
        error.value = null
        try {
            const fetch = useRequestFetch()
            await fetch<Venda>('/api/vendas', {
                method: 'POST',
                body: payload,
            })
            // Refresh current page and stats after adding
            await Promise.all([fetchVendas(activeFilters.value, 1), fetchStats()])
            currentPage.value = 1
        } catch (e: any) {
            error.value = e.data?.statusMessage || e.message || 'Erro ao salvar venda.'
            throw e
        } finally {
            saving.value = false
        }
    }

    async function setSort(newSortBy: string) {
        if (sortBy.value === newSortBy) {
            sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
        } else {
            sortBy.value = newSortBy
            sortOrder.value = 'desc' // Default to desc for new column
        }
        await fetchVendas(activeFilters.value, 1)
    }

    function setColumnFilter(column: string, value: string) {
        columnFilters.value = { ...columnFilters.value, [column]: value }
        fetchVendas(activeFilters.value, 1)
    }

    function openDetail(venda: Venda) {
        selectedVenda.value = venda
        isDetailModalOpen.value = true
    }

    function closeDetail() {
        isDetailModalOpen.value = false
        setTimeout(() => { selectedVenda.value = null }, 300)
    }

    async function updateVenda(id: number, payload: Partial<Venda>) {
        saving.value = true
        error.value = null
        try {
            const fetch = useRequestFetch()
            const updated = await fetch<Venda>(`/api/vendas/${id}`, {
                method: 'PATCH',
                body: payload,
            })
            // Refresh current page and stats after updating
            await Promise.all([fetchVendas(activeFilters.value, currentPage.value), fetchStats()])

            // If the updated sale is the one open in modal, update it
            if (selectedVenda.value?.id === id) {
                selectedVenda.value = { ...selectedVenda.value, ...updated }
            }
        } catch (e: any) {
            error.value = e.data?.statusMessage || e.message || 'Erro ao atualizar venda.'
            throw e
        } finally {
            saving.value = false
        }
    }

    async function deleteVenda(id: number) {
        deleting.value = id
        error.value = null
        try {
            const fetch = useRequestFetch()
            await fetch(`/api/vendas/${id}`, { method: 'DELETE' })
            // Refresh current page and stats after deletion
            await Promise.all([fetchVendas(activeFilters.value, currentPage.value), fetchStats()])
        } catch (e: any) {
            error.value = e.data?.statusMessage || e.message || 'Erro ao excluir venda.'
            throw e
        } finally {
            deleting.value = null
        }
    }

    return {
        vendas, total, loading, saving, deleting, error, activeFilters,
        currentPage, pageSize, totalPages,
        statsTotal, statsValorTotal, statsTicketMedio, statsMaiorVenda, statsLoading,
        totalVendas, valorTotal, ticketMedio,
        fetchVendas, fetchStats, applyFilters, addVenda, updateVenda, deleteVenda, goToPage,
        sortBy, sortOrder, setSort,
        columnFilters, setColumnFilter,
        selectedVenda, isDetailModalOpen, openDetail, closeDetail,
    }
})
