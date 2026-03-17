import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

interface DashboardMetricRow {
    date: string
    novos_clientes: number | string | null
    clientes_recorrentes: number | string | null
    vendas: number | string | null
    valor_vendas: number | string | null
}

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user?.sub) {
        throw createError({ statusCode: 401, message: 'Não autorizado.' })
    }

    const query = getQuery(event)
    const startDate = query.startDate as string | undefined
    const endDate = query.endDate as string | undefined

    if (!startDate || !endDate) {
        throw createError({ statusCode: 400, message: 'Os parâmetros startDate e endDate são obrigatórios.' })
    }

    const parsedStartDate = new Date(startDate)
    const parsedEndDate = new Date(endDate)

    if (Number.isNaN(parsedStartDate.getTime()) || Number.isNaN(parsedEndDate.getTime())) {
        throw createError({ statusCode: 400, message: 'Os parâmetros startDate e endDate devem ser datas válidas.' })
    }

    const client = await serverSupabaseClient(event)
    const { data, error } = await (client.rpc as any)('get_dashboard_metrics', {
        p_start_date: parsedStartDate.toISOString(),
        p_end_date: parsedEndDate.toISOString(),
    })

    if (error) {
        console.error('[dashboard/metrics] Erro ao buscar métricas:', error)
        throw createError({ statusCode: 500, message: 'Erro interno ao buscar métricas do dashboard.' })
    }

    return {
        metrics: (data ?? []) as DashboardMetricRow[],
    }
})