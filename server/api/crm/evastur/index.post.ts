import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { CrmEvasturDTO } from '../../../../shared/types/CrmEvasturDTO'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user?.sub) throw createError({ statusCode: 401, message: 'Não autorizado.' })

    const client = await serverSupabaseClient(event)
    const body = await readBody<Omit<CrmEvasturDTO, 'id' | 'created_at'>>(event)

    if (!body.contato_id) {
        throw createError({ statusCode: 400, message: 'contato_id é obrigatório.' })
    }

    const { data, error } = await client
        .from('crm_evastur')
        .insert([body])
        .select()
        .single()

    if (error) {
        console.error('[crm] Erro ao criar registro:', error)
        throw createError({ statusCode: 500, message: 'Erro interno ao criar registro.' })
    }

    return data as CrmEvasturDTO
})
