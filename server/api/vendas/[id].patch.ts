import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user?.sub) throw createError({ statusCode: 401, message: 'Não autorizado.' })

    const client = await serverSupabaseClient(event)
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id || isNaN(Number(id))) {
        throw createError({ statusCode: 400, message: 'ID da venda é obrigatório ou inválido.' })
    }

    const { data, error } = await client
        .from('historico_vendas_evastur')
        .update(body)
        .eq('id', Number(id))
        .select()
        .single()

    if (error) {
        console.error('[vendas] Erro ao atualizar venda:', error)
        throw createError({ statusCode: 500, message: 'Erro interno ao atualizar venda.' })
    }

    return data
})
