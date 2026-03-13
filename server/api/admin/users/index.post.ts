import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import { randomBytes } from 'node:crypto'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const escapeHtml = (value: string) =>
    value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')

  // 1. Verify authorization
  const user = await serverSupabaseUser(event)
  if (!user?.sub) throw createError({ statusCode: 401, message: 'Não autenticado' })

  const supabaseAdmin = serverSupabaseServiceRole(event)

  const { data: actorProfile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.sub)
    .single()

  if (actorProfile?.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Somente administradores.' })
  }

  // 2. Parse body
  const body = await readBody(event)
  const { email, name, role, vendedor_id, company, phone } = body

  if (!email || !name || !role) {
    throw createError({ statusCode: 400, message: 'Dados incompletos: Nome, Email e Nível de Acesso são obrigatórios.' })
  }

  if (!['admin', 'vendedor', 'user'].includes(role)) {
    throw createError({ statusCode: 400, message: 'Nível de acesso inválido.' })
  }

  // 3. Generate a cryptographically secure provisional password
  const generatePassword = (length = 16) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    const bytes = randomBytes(length)
    let res = ''
    for (let i = 0; i < length; i++) {
      res += charset.charAt(bytes[i] % charset.length)
    }
    return res
  }

  const defaultPassword = generatePassword()

  // 4. Create the user with the provisional password
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: defaultPassword,
    email_confirm: true,
    user_metadata: { name }
  })

  if (authError || !authData.user) {
    console.error('[admin/users] Erro ao criar usuário:', authError)
    throw createError({ statusCode: 400, message: authError?.message || 'Não foi possível criar o usuário. Verifique se o e-mail já está cadastrado.' })
  }

  const userId = authData.user.id

  // 5. Update or Insert the Profile Record
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: userId,
      email,
      name,
      role,
      vendedor_id: vendedor_id || null,
      company: company || null,
      phone: phone || null,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (profileError) {
    console.error('[admin/users] Erro ao criar perfil:', profileError)
    throw createError({ statusCode: 500, message: 'Usuário criado, mas erro ao configurar perfil.' })
  }

  // 6. Send invite email via Resend — password is sent ONLY via email, never in API response
  const config = useRuntimeConfig()
  const resendApiKey = config.resendApiKey
  const senderEmail = config.mailerSenderEmail
  const companySiteUrl = config.public.originalSiteUrl || config.public.siteUrl || 'https://evastur.com'
  const safeName = escapeHtml(String(name))
  const safeEmail = escapeHtml(String(email))
  const safePassword = escapeHtml(defaultPassword)
  let emailSent = false

  if (resendApiKey && senderEmail) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: senderEmail,
          to: [email],
          subject: 'Bem-vindo à Evastur ✨ Seu acesso está pronto',
          html: `
<div style="background: #f1f5f9; padding: 28px 12px;">
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; color: #1e293b;">
    <div style="background: linear-gradient(135deg, #2f81f7 0%, #2563eb 100%); padding: 28px 24px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 30px; font-weight: 900; margin: 0; letter-spacing: 0.3px;">Evastur</h1>
      <p style="color: #dbeafe; margin: 8px 0 0 0; font-size: 14px;">Plataforma de CRM e Gestão</p>
    </div>

    <div style="padding: 30px 24px;">
      <h2 style="font-size: 24px; font-weight: 800; margin: 0 0 14px 0; color: #0f172a;">Olá, ${safeName} 👋</h2>
      <p style="font-size: 16px; line-height: 1.7; margin: 0 0 18px 0; color: #475569;">
        Sua conta na plataforma Evastur foi criada com sucesso. Abaixo estão suas credenciais iniciais para acesso.
      </p>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 22px 0;">
        <p style="margin: 0 0 6px 0; font-size: 13px; color: #64748b;"><strong>Email</strong></p>
        <p style="margin: 0 0 14px 0; font-size: 15px; font-weight: 700; color: #0f172a;">${safeEmail}</p>

        <p style="margin: 0 0 6px 0; font-size: 13px; color: #64748b;"><strong>Senha provisória</strong></p>
        <p style="margin: 0; font-size: 16px; font-weight: 800; font-family: Consolas, Menlo, monospace; background: #ffffff; border: 1px solid #dbe2ea; padding: 10px 12px; border-radius: 8px; color: #0f172a;">${safePassword}</p>
      </div>

      <div style="text-align: center; margin: 26px 0 18px 0;">
        <a href="${companySiteUrl}" style="display: inline-block; background: #2f81f7; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 20px; border-radius: 10px;">Acessar site da Evastur</a>
      </div>

      <p style="font-size: 13px; line-height: 1.7; color: #64748b; margin: 0;">
        Por segurança, recomendamos alterar sua senha após o primeiro acesso.
      </p>

      <p style="font-size: 13px; line-height: 1.7; color: #64748b; margin: 10px 0 0 0;">
        Site oficial: <a href="${companySiteUrl}" style="color: #2f81f7; text-decoration: none; font-weight: 700;">${companySiteUrl}</a>
      </p>
    </div>

    <div style="padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #94a3b8;">
        Este email foi enviado automaticamente pela plataforma Evastur. Não responda este email.
      </p>
    </div>
  </div>
</div>`
,
          text: `Olá, ${name}!\n\nSua conta na plataforma Evastur foi criada com sucesso.\n\nEmail: ${email}\nSenha provisória: ${defaultPassword}\n\nAcesse o site da empresa: ${companySiteUrl}\n\nPor segurança, recomendamos alterar sua senha após o primeiro acesso.`
        })
      })
      emailSent = response.ok
      if (!response.ok) {
        console.error('[admin/users] Erro ao enviar email de convite:', await response.text())
      }
    } catch (err) {
      console.error('[admin/users] Erro ao enviar email de convite:', err)
    }
  }

  // Never return the password in the API response
  return { success: true, user: profile, emailSent }
})
