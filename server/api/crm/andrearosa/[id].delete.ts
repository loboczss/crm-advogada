import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user?.sub) throw createError({ statusCode: 401, message: 'Não autorizado.' })

    const client = await serverSupabaseClient(event)
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({ statusCode: 400, message: 'ID é obrigatório para exclusão.' })
    }

    const { error } = await client
        .from('crm_evastur')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('[crm] Erro ao deletar registro:', error)
        throw createError({ statusCode: 500, message: 'Erro interno ao deletar registro.' })
    }

    return { success: true }
})

