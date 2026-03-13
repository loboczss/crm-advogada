import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

interface MaiorVenda {
    id: number
    contact_name: string | null
    contato_id: string
    valor_venda: number | null
}

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user?.sub) throw createError({ statusCode: 401, message: 'Não autorizado.' })

    const client = await serverSupabaseClient(event)
    const query = getQuery(event)

    // Build base query with optional filters
    function applyFilters(q: any) {
        if (query.startDate) q = q.gte('created_at', query.startDate as string)
        if (query.endDate) q = q.lte('created_at', query.endDate as string)
        if (query.valorMin) q = q.gte('valor_venda', Number(query.valorMin))
        if (query.valorMax) q = q.lte('valor_venda', Number(query.valorMax))
        if (query.valorExato) q = q.eq('valor_venda', Number(query.valorExato))
        if (query.search) {
            const search = query.search as string
            q = q.or(`contact_name.ilike.%${search}%,contato_id.eq.${search}`)
        }
        return q
    }

    // Build both queries, then run in parallel
    let aggQuery = client
        .from('historico_vendas_evastur')
        .select('valor_venda', { count: 'exact' })
    aggQuery = applyFilters(aggQuery)

    let maiorQuery = client
        .from('historico_vendas_evastur')
        .select('id, contact_name, contato_id, valor_venda')
        .order('valor_venda', { ascending: false })
        .limit(1)
    maiorQuery = applyFilters(maiorQuery)

    const [aggResult, maiorResult] = await Promise.all([aggQuery, maiorQuery])

    if (aggResult.error) {
        console.error('[vendas/stats] Erro ao buscar agregados:', aggResult.error)
        throw createError({ statusCode: 500, message: 'Erro interno ao buscar estatísticas.' })
    }
    if (maiorResult.error) {
        console.error('[vendas/stats] Erro ao buscar maior venda:', maiorResult.error)
        throw createError({ statusCode: 500, message: 'Erro interno ao buscar estatísticas.' })
    }

    const { data: allRows, count } = aggResult
    const { data: maiorData } = maiorResult

    const rows = allRows ?? []
    const total = count ?? 0
    const valorTotal = rows.reduce((sum: number, r: any) => sum + (Number(r.valor_venda) || 0), 0)
    const ticketMedio = total > 0 ? valorTotal / total : 0

    const maiorVenda: MaiorVenda | null = maiorData?.[0] ?? null

    return {
        total,
        valorTotal,
        ticketMedio,
        maiorVenda,
    }
})
