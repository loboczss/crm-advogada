import { serverSupabaseServiceRole } from '#supabase/server'

function parseDocumentId(idParam: string | undefined) {
    const parsedId = Number(idParam)

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid document ID' })
    }

    return parsedId
}

export default defineEventHandler(async (event) => {
    const supabase = serverSupabaseServiceRole(event)
    const id = parseDocumentId(getRouterParam(event, 'id'))

    const { data, error } = await supabase
        .from('documents')
        .select('id, content, metadata')
        .eq('id', id)
        .single()

    if (error || !data) {
        throw createError({ statusCode: 404, statusMessage: error?.message || 'Documento não encontrado.' })
    }

    const metadata = (data.metadata ?? {}) as Record<string, any>
    const documentGroupId = metadata.document_group_id as string | undefined

    if ((!metadata.originalContent || !metadata.markdownContent) && documentGroupId) {
        const { data: sourceChunk } = await supabase
            .from('documents')
            .select('metadata')
            .contains('metadata', { document_group_id: documentGroupId, chunk_index: 1 })
            .limit(1)
            .maybeSingle()

        const sourceMetadata = (sourceChunk?.metadata ?? {}) as Record<string, any>

        return {
            ...data,
            metadata: {
                ...metadata,
                originalContent: metadata.originalContent || sourceMetadata.originalContent,
                markdownContent: metadata.markdownContent || sourceMetadata.markdownContent,
            },
        }
    }

    return data
})