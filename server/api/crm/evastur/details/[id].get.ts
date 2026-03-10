import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const contatoId = getRouterParam(event, 'id')

    if (!contatoId) {
        throw createError({ statusCode: 400, statusMessage: 'ID do contato não fornecido' })
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

    // 3. Fetch Whatsapp Messages
    const { data: whatsappData, error: whatsappError } = await client
        .from('todas_mensagens_whatsapp')
        .select('*')
        .eq('telefone', contatoId)
        .order('created_at', { ascending: true })

    if (whatsappError) {
        console.error('Erro ao buscar WhatsApp:', whatsappError)
    }

    return {
        crm: crmData || null,
        vendas: vendasData || [],
        whatsapp: whatsappData || []
    }
})
