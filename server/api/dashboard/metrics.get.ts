import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

interface DashboardMetricRow {
    date: string
    novos_clientes: number | string | null
    clientes_recorrentes: number | string | null
    vendas: number | string | null
    valor_vendas: number | string | null
}

interface LeadMessageRecord {
    created_at: string | null
    telefone: string | null
    primeira_mensagem: boolean | null
}

interface VendaRecord {
    created_at: string | null
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

    const client = serverSupabaseServiceRole(event)
    
    try {
        // Fetch lead messages data (source of leads)
        const { data: leadsData, error: leadsError } = await client
            .from('todas_mensagens_whatsapp')
            .select('created_at, telefone, primeira_mensagem')
            .gte('created_at', parsedStartDate.toISOString())
            .lte('created_at', parsedEndDate.toISOString())

        if (leadsError) throw leadsError

        // Fetch all sales records
        const { data: vendasData, error: vendasError } = await client
            .from('historico_vendas_evastur')
            .select('created_at, valor_venda')
            .gte('created_at', parsedStartDate.toISOString())
            .lte('created_at', parsedEndDate.toISOString())

        if (vendasError) throw vendasError

        // Process data: group by date and deduplicate leads
        const metricsMap = new Map<string, { novos: Set<string>; recorrentes: Set<string>; vendas: number; valor: number }>()

        // Dedup by telefone and keep the latest state for each lead.
        const latestLeadByTelefone = new Map<string, LeadMessageRecord>()

        ;(leadsData as LeadMessageRecord[]).forEach((lead) => {
            if (!lead.telefone || !lead.created_at) return

            const prev = latestLeadByTelefone.get(lead.telefone)
            if (!prev || !prev.created_at || new Date(lead.created_at) > new Date(prev.created_at)) {
                latestLeadByTelefone.set(lead.telefone, lead)
            }
        })

        ;(latestLeadByTelefone.values()).forEach((lead) => {
            if (!lead.created_at || !lead.telefone) return

            const dateStr = lead.created_at.split('T')[0]
            if (!metricsMap.has(dateStr)) {
                metricsMap.set(dateStr, { novos: new Set(), recorrentes: new Set(), vendas: 0, valor: 0 })
            }

            const metrics = metricsMap.get(dateStr)!

            const isPrimeiraMensagem = lead.primeira_mensagem === true

            if (isPrimeiraMensagem) {
                metrics.novos.add(lead.telefone)
            } else {
                metrics.recorrentes.add(lead.telefone)
            }
        })

        // Process sales
        ;(vendasData as VendaRecord[]).forEach(venda => {
            if (!venda.created_at) return
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