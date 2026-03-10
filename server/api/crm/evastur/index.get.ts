import { serverSupabaseClient } from '#supabase/server'
import type { CrmEvasturDTO } from '../../../../shared/types/CrmEvasturDTO'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const query = getQuery(event)

    const page = Number(query.page ?? 1)
    const pageSize = Number(query.pageSize ?? 25)
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
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return {
        records: (data ?? []) as CrmEvasturDTO[],
        total: count ?? 0,
        page,
        pageSize
    }
})
