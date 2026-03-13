import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user?.sub) throw createError({ statusCode: 401, message: 'Não autorizado.' })

    const supabaseAdmin = serverSupabaseServiceRole(event)

    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.sub)
        .single()

    if (profile?.role !== 'admin') {
        throw createError({ statusCode: 403, message: 'Acesso restrito a administradores.' })
    }

    const { data: mensagens } = await supabaseAdmin
        .from('todas_mensagens_whatsapp')
        .select('*')
        .limit(1)

    const { data: vendas } = await supabaseAdmin
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
