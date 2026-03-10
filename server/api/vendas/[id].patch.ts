import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id || isNaN(Number(id))) {
        throw createError({ statusCode: 400, statusMessage: 'ID da venda é obrigatório ou inválido.' })
    }

    const { data, error } = await client
        .from('historico_vendas_evastur')
        .update(body)
        .eq('id', Number(id))
        .select()
        .single()

    if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return data
})
