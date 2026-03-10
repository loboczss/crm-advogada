import { serverSupabaseClient } from '#supabase/server'
import type { Venda } from '../../../shared/types/VendaDTO'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)

    const query = getQuery(event)
    const page = Number(query.page ?? 1)
    const pageSize = Number(query.pageSize ?? 25)
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const sortBy = (query.sortBy as string) || 'created_at'
    const sortOrder = (query.sortOrder as 'asc' | 'desc') || 'desc'

    let q = client
        .from('historico_vendas_evastur')
        .select('*', { count: 'exact' })
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(from, to)

    // Apply primary filters
    if (query.startDate) q = q.gte('created_at', query.startDate as string)
    if (query.endDate) q = q.lte('created_at', query.endDate as string)
    if (query.valorMin) q = q.gte('valor_venda', Number(query.valorMin))
    if (query.valorMax) q = q.lte('valor_venda', Number(query.valorMax))
    if (query.valorExato) q = q.eq('valor_venda', Number(query.valorExato))
    if (query.valorAprox) {
        const aprox = Number(query.valorAprox)
        const tolerance = aprox * 0.1 // ±10%
        q = q.gte('valor_venda', aprox - tolerance).lte('valor_venda', aprox + tolerance)
    }

    // Apply column-specific filters
    if (query.filter_contact_name) q = q.ilike('contact_name', `%${query.filter_contact_name}%`)
    if (query.filter_vendedor) q = q.ilike('vendedor', `%${query.filter_vendedor}%`)
    if (query.filter_status) q = q.ilike('status', `%${query.filter_status}%`)
    if (query.filter_tipo_venda) q = q.ilike('tipo_venda', `%${query.filter_tipo_venda}%`)
    if (query.filter_forma_pagamento) q = q.ilike('forma_pagamento', `%${query.filter_forma_pagamento}%`)
    if (query.filter_embarque) q = q.ilike('embarque', `%${query.filter_embarque}%`)
    if (query.filter_created_at) q = q.ilike('created_at', `%${query.filter_created_at}%`)

    const { data, error, count } = await q

    if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return {
        vendas: (data ?? []) as Venda[],
        total: count ?? 0,
        page,
        pageSize,
    }
})
