import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)

    // Fetch various counts for KPIs
    const [
        totalRes,
        highUrgencyRes,
        sentimentRes
    ] = await Promise.all([
        client.from('crm_evastur').select('*', { count: 'exact', head: true }),
        client.from('crm_evastur').select('*', { count: 'exact', head: true }).eq('urgencia', 'Alta'),
        client.from('crm_evastur').select('sentimento')
    ])

    // Error handling
    if (totalRes.error) throw createError({ statusCode: 500, statusMessage: totalRes.error.message })
    if (highUrgencyRes.error) throw createError({ statusCode: 500, statusMessage: highUrgencyRes.error.message })
    if (sentimentRes.error) throw createError({ statusCode: 500, statusMessage: sentimentRes.error.message })

    const totalCount = totalRes.count ?? 0
    const highUrgencyCount = highUrgencyRes.count ?? 0
    const leadsWithSentiment = sentimentRes.data ?? []

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

    // Conversion rate
    // We consider 'Finalizada' in fase_obra as conversion
    const { count: convertedCount, error: convError } = await client
        .from('crm_evastur')
        .select('*', { count: 'exact', head: true })
        .eq('fase_obra', 'Finalizada')

    if (convError) throw createError({ statusCode: 500, statusMessage: convError.message })

    const conversionRate = totalCount > 0 ? Math.round((convertedCount ?? 0) / totalCount * 100) : 0

    return {
        totalLeads: totalCount,
        highUrgency: highUrgencyCount,
        sentiment: sentimentScore,
        conversionRate: conversionRate
    }
})
