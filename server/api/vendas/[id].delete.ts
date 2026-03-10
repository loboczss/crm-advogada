import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const id = getRouterParam(event, 'id')

    if (!id || isNaN(Number(id))) {
        throw createError({ statusCode: 400, statusMessage: 'ID inválido.' })
    }

    const { error } = await client
        .from('historico_vendas_evastur')
        .delete()
        .eq('id', Number(id))

    if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return { success: true }
})
