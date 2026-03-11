import { serverSupabaseClient } from '#supabase/server'
import type { EvaSystemPrompt } from '../../../shared/types/EvaSystemPromptDTO'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)

    const { data, error } = await client
        .from('eva_system_prompt')
        .select('*')
        .order('id', { ascending: true })
        .limit(1)
        .single()

    if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return data as EvaSystemPrompt
})
