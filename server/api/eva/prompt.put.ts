import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import type { EvaSystemPrompt } from '../../../shared/types/EvaSystemPromptDTO'

export default defineEventHandler(async (event) => {
    const body = await readBody<{ content: string; agent_name?: string }>(event)

    if (!body || typeof body.content !== 'string') {
        throw createError({ statusCode: 400, message: 'Campo "content" é obrigatório.' })
    }

    const agentName = body.agent_name || 'master'

    // Use the user client to get the authenticated user from the session cookies
    const userClient = await serverSupabaseClient(event)
    const { data: { user }, error: authError } = await userClient.auth.getUser()

    if (authError || !user) {
        throw createError({
            statusCode: 401,
            message: authError?.message || 'Usuário não autenticado. Faça login novamente.'
        })
    }

    // Use service role to bypass RLS and guarantee the update succeeds
    const adminClient = serverSupabaseServiceRole(event)

    // Get the existing row for this agent
    const { data: existing } = await adminClient
        .from('eva_system_prompt')
        .select('*')
        .eq('agent_name', agentName)
        .limit(1)
        .maybeSingle()

    let result: EvaSystemPrompt

    if (!existing) {
        // Create first version
        const { data, error } = await adminClient
            .from('eva_system_prompt')
            .insert({
                agent_name: agentName,
                content: body.content,
                version: 1,
                updated_at: new Date().toISOString(),
                updated_by: user.id,
            })
            .select()
            .single()

        if (error) { console.error('[eva/prompt] Erro ao criar prompt:', error); throw createError({ statusCode: 500, message: 'Erro interno ao criar prompt.' }) }
        result = data as EvaSystemPrompt
    } else {
        // Save history before updating
        const { error: historyError } = await adminClient
            .from('eva_prompt_history')
            .insert({
                prompt_id: existing.id,
                agent_name: existing.agent_name,
                content: existing.content,
                version: existing.version,
                updated_at: existing.updated_at,
                updated_by: existing.updated_by
            })

        if (historyError) { console.error('[eva/prompt] Erro ao salvar histórico:', historyError); throw createError({ statusCode: 500, message: 'Falha ao salvar histórico do prompt.' }) }

        // Update to next version
        const { data, error } = await adminClient
            .from('eva_system_prompt')
            .update({
                content: body.content,
                version: existing.version + 1,
                updated_at: new Date().toISOString(),
                updated_by: user.id,
            })
            .eq('id', existing.id)
            .select()
            .single()

        if (error) { console.error('[eva/prompt] Erro ao atualizar prompt:', error); throw createError({ statusCode: 500, message: 'Erro interno ao atualizar prompt.' }) }
        result = data as EvaSystemPrompt
    }

    return result
})
