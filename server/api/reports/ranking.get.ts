import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user?.sub) throw createError({ statusCode: 401, message: 'Não autorizado.' })

    const client = await serverSupabaseClient(event)
    const { startDate, endDate } = getQuery(event)

    if (!startDate || !endDate) {
        throw createError({ statusCode: 400, message: 'startDate and endDate are required' })
    }

    // Chamada ao RPC otimizado no banco de dados
    // Isso resolve: 
    // 1. Performance (cálculo no banco)
    // 2. Acurácia (COUNT DISTINCT real de todos os registros)
    // 3. Tipagem (vendedor_id texto vs int)
    const { data, error } = await client.rpc('get_vendedor_ranking', {
        start_date: startDate as string,
        end_date: endDate as string
    })

    if (error) {
        console.error('[reports/ranking] Erro ao processar ranking:', error)
        throw createError({ statusCode: 500, message: 'Erro interno ao processar ranking.' })
    }

    return { ranking: data || [] }
})
