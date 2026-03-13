import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { CrmEvasturDTO } from '../../../../shared/types/CrmEvasturDTO'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user?.sub) throw createError({ statusCode: 401, message: 'Não autorizado.' })

    const client = await serverSupabaseClient(event)
    const id = getRouterParam(event, 'id')
    const body = await readBody<Partial<CrmEvasturDTO>>(event)

    if (!id) {
        throw createError({ statusCode: 400, message: 'ID é obrigatório para atualização.' })
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
        console.error('[crm] Erro ao atualizar registro:', error)
        throw createError({ statusCode: 500, message: 'Erro interno ao atualizar registro.' })
    }

    return data as CrmEvasturDTO
})
