import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

interface DashboardMetricRow {
    date: string
    novos_clientes: number | string | null
    clientes_recorrentes: number | string | null
    vendas: number | string | null
    valor_vendas: number | string | null
}

interface CrmEvasturRecord {
    id: number
    created_at: string
    contato_id: string
    compras_cliente: any | null
}

interface VendaRecord {
    created_at: string
    valor_venda: number | null
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
    
    try {
        // Fetch all CRM Evastur records (leads)
        const { data: evasturData, error: evasturError } = await client
            .from('crm_evastur')
            .select('id, created_at, contato_id, compras_cliente')
            .gte('created_at', parsedStartDate.toISOString())
            .lte('created_at', parsedEndDate.toISOString())

        if (evasturError) throw evasturError

        // Fetch all sales records
        const { data: vendasData, error: vendasError } = await client
            .from('historico_vendas_evastur')
            .select('created_at, valor_venda')
            .gte('created_at', parsedStartDate.toISOString())
            .lte('created_at', parsedEndDate.toISOString())

        if (vendasError) throw vendasError

        // Process data: group by date and deduplicate leads
        const metricsMap = new Map<string, { novos: Set<string>; recorrentes: Set<string>; vendas: number; valor: number }>()

        // Process leads - each lead should be counted ONLY ONCE based on its CURRENT status
        const leadsProcessed = new Set<number>()
        
        ;(evasturData as CrmEvasturRecord[]).forEach(lead => {
            // Only count each lead ID once, based on current state
            if (!leadsProcessed.has(lead.id)) {
                leadsProcessed.add(lead.id)
                
                const dateStr = lead.created_at.split('T')[0]
                if (!metricsMap.has(dateStr)) {
                    metricsMap.set(dateStr, { novos: new Set(), recorrentes: new Set(), vendas: 0, valor: 0 })
                }

                const metrics = metricsMap.get(dateStr)!

                // Determine if lead is new or recurrent based on CURRENT compras_cliente state
                const hasCompras = lead.compras_cliente && 
                    (Array.isArray(lead.compras_cliente) ? lead.compras_cliente.length > 0 : true)

                if (hasCompras) {
                    metrics.recorrentes.add(lead.contato_id)
                } else {
                    metrics.novos.add(lead.contato_id)
                }
            }
        })

        // Process sales
        ;(vendasData as VendaRecord[]).forEach(venda => {
            const dateStr = venda.created_at.split('T')[0]
            if (!metricsMap.has(dateStr)) {
                metricsMap.set(dateStr, { novos: new Set(), recorrentes: new Set(), vendas: 0, valor: 0 })
            }

            const metrics = metricsMap.get(dateStr)!
            metrics.vendas += 1
            metrics.valor += venda.valor_venda || 0
        })

        // Convert to final format
        const metrics: DashboardMetricRow[] = Array.from(metricsMap.entries())
            .map(([date, data]) => ({
                date,
                novos_clientes: data.novos.size,
                clientes_recorrentes: data.recorrentes.size,
                vendas: data.vendas,
                valor_vendas: data.valor,
            }))
            .sort((a, b) => a.date.localeCompare(b.date))

        return { metrics }
    } catch (error: any) {
        console.error('[dashboard/metrics] Erro ao buscar métricas:', error)
        throw createError({ statusCode: 500, message: 'Erro interno ao buscar métricas do dashboard.' })
    }
})