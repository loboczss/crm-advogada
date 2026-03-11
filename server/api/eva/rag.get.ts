import { serverSupabaseServiceRole } from '#supabase/server'

function summarizeMetadata(metadata: Record<string, any> | null | undefined) {
    if (!metadata) {
        return null
    }

    const {
        originalContent: _originalContent,
        markdownContent: _markdownContent,
        ...summary
    } = metadata

    return summary
}

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

    return (data ?? []).map((item) => ({
        ...item,
        metadata: summarizeMetadata(item.metadata as Record<string, any> | null | undefined),
    }))
})
