import { serverSupabaseClient } from '#supabase/server'
import type { Venda } from '../../../shared/types/VendaDTO'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const body = await readBody<Omit<Venda, 'id' | 'created_at'>>(event)

    if (!body.contato_id) {
        throw createError({ statusCode: 400, statusMessage: 'contato_id é obrigatório.' })
    }

    const { data, error } = await client
        .from('historico_vendas_evastur')
        .insert([body])
        .select()
        .single()

    if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return data as Venda
})
