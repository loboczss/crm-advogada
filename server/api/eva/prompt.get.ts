import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { EvaSystemPrompt } from '../../../shared/types/EvaSystemPromptDTO'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user?.sub) throw createError({ statusCode: 401, message: 'Não autorizado.' })

    const client = await serverSupabaseClient(event)
    const query = getQuery(event)
    const agentName = (query.agent as string) || 'master'

    const { data, error } = await client
        .from('eva_system_prompt')
        .select('*')
        .eq('agent_name', agentName)
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error('[eva/prompt] Erro ao buscar prompt:', error)
        throw createError({ statusCode: 500, message: 'Erro interno ao buscar prompt.' })
    }

    if (!data) {
        // Return a mock default if the agent prompt doesn't exist yet
        return {
            id: 0,
            agent_name: agentName,
            content: '',
            version: 1,
            updated_at: new Date().toISOString(),
            updated_by: null
        } as EvaSystemPrompt
    }

    return data as EvaSystemPrompt
})
