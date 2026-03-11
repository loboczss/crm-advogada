import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    
    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'Missing ID' })
    }

    const client = await serverSupabaseClient(event)

    const { error } = await client
        .from('documents')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting document:', error)
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return { success: true }
})
