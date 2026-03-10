import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID é obrigatório para exclusão.' })
    }

    const { error } = await client
        .from('crm_evastur')
        .delete()
        .eq('id', id)

    if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return { success: true }
})
