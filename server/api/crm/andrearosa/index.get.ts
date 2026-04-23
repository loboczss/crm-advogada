import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { CrmAndreaRosaDTO } from '../../../../shared/types/CrmAndreaRosaDTO'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user?.sub) throw createError({ statusCode: 401, message: 'Não autorizado.' })

    const client = await serverSupabaseClient(event)
    const query = getQuery(event)

    const page = Number(query.page ?? 1)
    const pageSize = Math.min(Number(query.pageSize ?? 25), 100)
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let q = client
        .from('crm_evastur')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

    if (query.search) {
        const search = query.search as string
        q = q.or(`nome.ilike.%${search}%,email.ilike.%${search}%,contato_id.ilike.%${search}%`)
    }

    const { data, error, count } = await q

    if (error) {
        console.error('[crm] Erro ao buscar registros:', error)
        throw createError({ statusCode: 500, message: 'Erro interno ao buscar registros.' })
    }

    return {
        records: (data ?? []) as CrmAndreaRosaDTO[],
        total: count ?? 0,
        page,
        pageSize
    }
})

