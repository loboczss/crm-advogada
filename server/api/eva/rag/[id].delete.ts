import { serverSupabaseServiceRole } from '#supabase/server'

function parseDocumentId(idParam: string | undefined) {
    const parsedId = Number(idParam)

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid document ID' })
    }

    return parsedId
}

export default defineEventHandler(async (event) => {
    const id = parseDocumentId(getRouterParam(event, 'id'))
    const client = serverSupabaseServiceRole(event)

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
