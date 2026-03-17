import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { CrmEvasturDTO } from '../../../../shared/types/CrmEvasturDTO'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user?.sub) throw createError({ statusCode: 401, message: 'Não autorizado.' })

    const client = await serverSupabaseClient(event)

    // Fetch all KPI data in parallel
    const [
        totalRes,
        highUrgencyRes,
        sentimentRes,
        convertedRes
    ] = await Promise.all([
        client.from('crm_evastur').select('*', { count: 'exact', head: true }),
        client.from('crm_evastur').select('*', { count: 'exact', head: true }).eq('urgencia', 'Alta'),
        client.from('crm_evastur').select('sentimento'),
        client.from('crm_evastur').select('*', { count: 'exact', head: true }).eq('fase_obra', 'Finalizada'),
    ])

    if (totalRes.error) { console.error('[crm/stats] Erro total:', totalRes.error); throw createError({ statusCode: 500, message: 'Erro interno ao buscar estatísticas.' }) }
    if (highUrgencyRes.error) { console.error('[crm/stats] Erro urgência:', highUrgencyRes.error); throw createError({ statusCode: 500, message: 'Erro interno ao buscar estatísticas.' }) }
    if (sentimentRes.error) { console.error('[crm/stats] Erro sentimento:', sentimentRes.error); throw createError({ statusCode: 500, message: 'Erro interno ao buscar estatísticas.' }) }
    if (convertedRes.error) { console.error('[crm/stats] Erro conversão:', convertedRes.error); throw createError({ statusCode: 500, message: 'Erro interno ao calcular taxa de conversão.' }) }

    const totalCount = totalRes.count ?? 0
    const highUrgencyCount = highUrgencyRes.count ?? 0
    const leadsWithSentiment = (sentimentRes.data as Pick<CrmEvasturDTO, 'sentimento'>[]) ?? []
    const convertedCount = convertedRes.count ?? 0

    // Calculate sentiment average
    let sentimentScore = 0
    if (leadsWithSentiment.length > 0) {
        const scores: number[] = leadsWithSentiment.map((l) => {
            const s = l.sentimento
            if (s === 'Positivo' || s === 'Extremamente Positivo') return 100
            if (s === 'Neutro') return 50
            return 0
        })
        sentimentScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    }

    const conversionRate = totalCount > 0 ? Math.round(convertedCount / totalCount * 100) : 0

    return {
        totalLeads: totalCount,
        highUrgency: highUrgencyCount,
        sentiment: sentimentScore,
        conversionRate: conversionRate
    }
})
