import OpenAI from 'openai'
import type { OpenAIChatPayload, OpenAIChatResponse } from '../../../shared/constants/openaiModels'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const apiKey = config.openaiApiKey

    if (!apiKey) {
        throw createError({
            statusCode: 500,
            statusMessage: 'OPENAI_API_KEY não configurada no servidor.'
        })
    }

    const body = await readBody<OpenAIChatPayload>(event)

    if (!body?.model || !body?.messages?.length) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Campos "model" e "messages" são obrigatórios.'
        })
    }

    const openai = new OpenAI({ apiKey: apiKey as string })

    const completion = await openai.chat.completions.create({
        model: body.model,
        messages: body.messages,
        temperature: body.temperature ?? 0.7,
        ...(body.max_tokens ? { max_tokens: body.max_tokens } : {}),
    })

    return completion as unknown as OpenAIChatResponse
})
