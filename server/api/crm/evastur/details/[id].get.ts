import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user?.sub) throw createError({ statusCode: 401, message: 'Não autorizado.' })

    const client = await serverSupabaseClient(event)
    const contatoId = getRouterParam(event, 'id')

    if (!contatoId) {
        throw createError({ statusCode: 400, message: 'ID do contato não fornecido' })
    }

    // 1. Fetch CRM data
    const { data: crmData, error: crmError } = await client
        .from('crm_evastur')
        .select('*')
        .eq('contato_id', contatoId)
        .single()

    if (crmError && crmError.code !== 'PGRST116') { // PGRST116 is not found
        console.error('Erro ao buscar CRM:', crmError)
    }

    // 2. Fetch Sales data
    const { data: vendasData, error: vendasError } = await client
        .from('historico_vendas_evastur')
        .select('*')
        .eq('contato_id', contatoId)
        .order('created_at', { ascending: false })

    if (vendasError) {
        console.error('Erro ao buscar Vendas:', vendasError)
    }

    // 3. Fetch Whatsapp Messages (limited to the 200 most recent)
    const { data: whatsappData, error: whatsappError } = await client
        .from('todas_mensagens_whatsapp')
        .select('*')
        .eq('telefone', contatoId)
        .order('created_at', { ascending: false })
        .limit(200)

    if (whatsappError) {
        console.error('Erro ao buscar WhatsApp:', whatsappError)
    }

    const whatsappTimeline = (whatsappData || []).slice().reverse()

    return {
        crm: crmData || null,
        vendas: vendasData || [],
        whatsapp: whatsappTimeline
    }
})
