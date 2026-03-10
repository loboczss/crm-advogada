import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = serverSupabaseServiceRole(event)

    const { data: mensagens } = await client
        .from('todas_mensagens_whatsapp')
        .select('*')
        .limit(1)

    const { data: vendas } = await client
        .from('historico_vendas_evastur')
        .select('*')
        .limit(1)

    return {
        mensagens_cols: mensagens?.[0] ? Object.keys(mensagens[0]) : [],
        vendas_cols: vendas?.[0] ? Object.keys(vendas[0]) : [],
        mensagens_sample: mensagens?.[0],
        vendas_sample: vendas?.[0]
    }
})
