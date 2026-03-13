import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user?.sub) throw createError({ statusCode: 401, message: 'Não autorizado.' })

    const client = await serverSupabaseClient(event)
    const id = getRouterParam(event, 'id')

    if (!id || isNaN(Number(id))) {
        throw createError({ statusCode: 400, message: 'ID inválido.' })
    }

    const { error } = await client
        .from('historico_vendas_evastur')
        .delete()
        .eq('id', Number(id))

    if (error) {
        console.error('[vendas] Erro ao deletar venda:', error)
        throw createError({ statusCode: 500, message: 'Erro interno ao deletar venda.' })
    }

    return { success: true }
})
