import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const supabase = serverSupabaseServiceRole(event)

    // Fetch all rows from the documents vector store table
    // Exclude the embedding column (large binary vector — not needed for display)
    const { data, error } = await supabase
        .from('documents')
        .select('id, content, metadata')
        .order('id', { ascending: false })

    if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return data ?? []
})
