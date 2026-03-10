import { ref, computed } from 'vue'

export interface RankingItem {
    id: string
    nome: string
    clientes: number
    vendas: number
    valor: number
    conversao: number
}

export function useRankingData() {
    const loading = ref(false)
    const error = ref<string | null>(null)
    const ranking = ref<RankingItem[]>([])

    // Date filtering state
    const defaultStartDate = new Date()
    defaultStartDate.setDate(defaultStartDate.getDate() - 30) // Default to last 30 days

    const startDate = ref<string>(defaultStartDate.toISOString().split('T')[0]!)
    const endDate = ref<string>(new Date().toISOString().split('T')[0]!)

    // Hidden Sellers state
    const hiddenSellers = ref<Set<string>>(new Set())

    // Computed property to return only visible ranking items
    const visibleRanking = computed(() => {
        return ranking.value.filter(seller => !hiddenSellers.value.has(seller.id))
    })

    // Fetch logic
    const fetchRankingData = async () => {
        loading.value = true
        error.value = null
        try {
            // Append time to ensure full days are covered
            const startIso = new Date(`${startDate.value}T00:00:00.000Z`).toISOString()
            const endIso = new Date(`${endDate.value}T23:59:59.999Z`).toISOString()

            const response = await $fetch<{ ranking: RankingItem[] }>(`/api/reports/ranking`, {
                params: {
                    startDate: startIso,
                    endDate: endIso
                }
            })

            ranking.value = response.ranking || []
        } catch (e: any) {
            error.value = 'Houve um erro ao buscar o ranking: ' + e.message
            console.error(e)
        } finally {
            loading.value = false
        }
    }

    // Hide / Show logic
    const toggleSellerVisibility = (sellerId: string | number) => {
        const idStr = String(sellerId)
        if (hiddenSellers.value.has(idStr)) {
            hiddenSellers.value.delete(idStr)
        } else {
            hiddenSellers.value.add(idStr)
        }
    }

    const showAllSellers = () => {
        hiddenSellers.value.clear()
    }

    return {
        loading,
        error,
        startDate,
        endDate,
        ranking,
        visibleRanking,
        hiddenSellers,
        fetchRankingData,
        toggleSellerVisibility,
        showAllSellers
    }
}
