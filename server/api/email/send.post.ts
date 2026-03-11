import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  // 1. Authenticate user
  const user = await serverSupabaseUser(event)
  if (!user?.sub) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  // 2. Read request body
  const body = await readBody(event)
  const { to, subject, html, text } = body

  if (!to || !subject || (!html && !text)) {
    throw createError({ statusCode: 400, message: 'Faltam campos obrigatórios: to, subject, html/text.' })
  }

  // Configuration
  const config = useRuntimeConfig()
  const resendApiKey = config.resendApiKey
  const senderEmail = config.mailerSenderEmail

  if (!resendApiKey || !senderEmail) {
    throw createError({ statusCode: 500, message: 'Configuração de envio de email ausente no servidor.' })
  }

  // 3. Send email to Resend API
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: senderEmail,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw createError({ statusCode: response.status, message: `Erro da API Resend: ${errorData?.message || response.statusText}` })
    }

    const resendData = await response.json()
    return { success: true, data: resendData }

  } catch (err: any) {
    console.error('Email send error:', err)
    throw createError({ statusCode: err.statusCode || 500, message: err.message || 'Erro interno ao enviar o email.' })
  }
})
