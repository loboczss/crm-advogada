import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)

    const { data, error } = await client
        .from('eva_system_prompt')
        .select('agent_name')
        .order('agent_name', { ascending: true })

    if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    // Retorna uma array de strings com os nomes dos agentes
    return data.map((row: any) => row.agent_name) as string[]
})
