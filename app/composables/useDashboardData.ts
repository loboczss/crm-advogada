import { ref, computed } from 'vue'
import { useSupabaseClient } from '#imports'

export const useDashboardData = () => {
    const supabase = useSupabaseClient()

    const loading = ref(false)
    const error = ref<string | null>(null)

    // Period management
    const periods = [
        { label: 'Hoje', value: 0 },
        { label: 'Últimos 7 dias', value: 7 },
        { label: 'Últimos 30 dias', value: 30 },
        { label: 'Este Mês', value: 'month' },
        { label: 'Este Ano', value: 'year' },
    ]
    const selectedPeriod = ref(periods[2]!) // Default to 30 days

    // KPIs (Filtered by selected period)
    const novosLeads = ref(0)
    const recorrentes = ref(0)
    const leadsNoPeriodo = ref(0)
    const vendasNoPeriodo = ref(0)
    const valorVendasNoPeriodo = ref(0)

    // Totais do Período (Internal use)
    const totalLeadsPeriodo = ref(0)
    const totalRecorrentesPeriodo = ref(0)
    const totalVendasPeriodo = ref(0)
    const valorTotalVendasPeriodo = ref(0)

    // Charts Data
    const chartData = ref<{ date: string; leads: number; recorrentes: number; vendas: number }[]>([])

    const fetchDashboardData = async () => {
        loading.value = true
        error.value = null

        try {
            const now = new Date()
            let startDate = new Date()

            if (typeof selectedPeriod.value.value === 'number') {
                if (selectedPeriod.value.value === 0) {
                    // "Hoje" starts at the beginning of today local time
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
                } else {
                    startDate.setDate(now.getDate() - selectedPeriod.value.value)
                }
            } else if (selectedPeriod.value.value === 'month') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            } else if (selectedPeriod.value.value === 'year') {
                startDate = new Date(now.getFullYear(), 0, 1)
            }

            const startIso = startDate.toISOString()
            const endIso = now.toISOString()

            // Fetch Data from DB via RPC
            const { data, error: rpcError } = await (supabase.rpc as any)('get_dashboard_metrics', {
                p_start_date: startIso,
                p_end_date: endIso
            })

            if (rpcError) throw rpcError

            calculateMetrics(data || [])

        } catch (e: any) {
            console.error('Error fetching dashboard data:', e)
            error.value = e.message
        } finally {
            loading.value = false
        }
    }

    const calculateMetrics = (metricsData: any[]) => {
        let tNovos = 0
        let tRecorrentes = 0
        let tVendas = 0
        let tValorVendas = 0

        const formattedChartData = metricsData.map(point => {
            const novos = Number(point.novos_clientes) || 0
            const recorrentesCount = Number(point.clientes_recorrentes) || 0
            const vendasCount = Number(point.vendas) || 0
            const valorVendas = Number(point.valor_vendas) || 0

            tNovos += novos
            tRecorrentes += recorrentesCount
            tVendas += vendasCount
            tValorVendas += valorVendas

            const [year, month, day] = point.date.split('-')

            return {
                date: `${day}/${month}`,
                leads: novos,
                recorrentes: recorrentesCount,
                vendas: vendasCount
            }
        })

        // Update KPIs for the SELECTED PERIOD
        novosLeads.value = tNovos
        recorrentes.value = tRecorrentes
        leadsNoPeriodo.value = tNovos + tRecorrentes
        vendasNoPeriodo.value = tVendas
        valorVendasNoPeriodo.value = tValorVendas

        totalLeadsPeriodo.value = tNovos + tRecorrentes
        totalRecorrentesPeriodo.value = tRecorrentes
        totalVendasPeriodo.value = tVendas
        valorTotalVendasPeriodo.value = tValorVendas

        chartData.value = formattedChartData
    }

    return {
        loading,
        error,
        periods,
        selectedPeriod,
        novosLeads,
        recorrentes,
        leadsNoPeriodo,
        vendasNoPeriodo,
        valorVendasNoPeriodo,
        totalLeadsPeriodo,
        totalRecorrentesPeriodo,
        totalVendasPeriodo,
        valorTotalVendasPeriodo,
        chartData,
        fetchDashboardData
    }
}
