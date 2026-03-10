import { serverSupabaseClient } from '#supabase/server'
import type { CrmEvasturDTO } from '../../../../shared/types/CrmEvasturDTO'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const id = getRouterParam(event, 'id')
    const body = await readBody<Partial<CrmEvasturDTO>>(event)

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID é obrigatório para atualização.' })
    }

    // Remove id and created_at from body if present to avoid issues
    const { id: _, created_at: __, ...updateData } = body as any

    const { data, error } = await client
        .from('crm_evastur')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return data as CrmEvasturDTO
})
