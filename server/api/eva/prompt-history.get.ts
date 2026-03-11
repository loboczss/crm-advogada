import { serverSupabaseClient } from '#supabase/server'
import type { PromptHistoryDTO } from '../../../shared/types/EvaSystemPromptDTO'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const query = getQuery(event)
    const agentName = (query.agent as string) || 'master'

    const { data, error } = await client
        .from('eva_prompt_history')
        .select(`
            history_id,
            prompt_id,
            agent_name,
            content,
            version,
            updated_at,
            updated_by
        `)
        .eq('agent_name', agentName)
        .order('version', { ascending: false })

    if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    // Map to ensure the user_email field exists for the UI without breaking
    return data.map((item: any) => ({
        ...item,
        user_email: item.updated_by ? `Admin (${item.updated_by.substring(0,8)})` : 'Sistema'
    })) as PromptHistoryDTO[]
})
