import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import type { EvaSystemPrompt } from '../../../shared/types/EvaSystemPromptDTO'

export default defineEventHandler(async (event) => {
    const body = await readBody<{ content: string }>(event)

    if (!body || typeof body.content !== 'string') {
        throw createError({ statusCode: 400, statusMessage: 'Campo "content" é obrigatório.' })
    }

    // Use the user client to get the authenticated user from the session cookies
    const userClient = await serverSupabaseClient(event)
    const { data: { user }, error: authError } = await userClient.auth.getUser()

    if (authError || !user) {
        throw createError({
            statusCode: 401,
            statusMessage: authError?.message || 'Usuário não autenticado. Faça login novamente.'
        })
    }

    // Use service role to bypass RLS and guarantee the update succeeds
    const adminClient = serverSupabaseServiceRole(event)

    // Get the first row (upsert pattern)
    const { data: existing } = await adminClient
        .from('eva_system_prompt')
        .select('id')
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle()

    let result: EvaSystemPrompt

    if (!existing) {
        const { data, error } = await adminClient
            .from('eva_system_prompt')
            .insert({
                content: body.content,
                updated_at: new Date().toISOString(),
                updated_by: user.id,
            })
            .select()
            .single()

        if (error) throw createError({ statusCode: 500, statusMessage: error.message })
        result = data as EvaSystemPrompt
    } else {
        const { data, error } = await adminClient
            .from('eva_system_prompt')
            .update({
                content: body.content,
                updated_at: new Date().toISOString(),
                updated_by: user.id,
            })
            .eq('id', existing.id)
            .select()
            .single()

        if (error) throw createError({ statusCode: 500, statusMessage: error.message })
        result = data as EvaSystemPrompt
    }

    return result
})
