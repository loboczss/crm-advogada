import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
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
  const { email, name, role, vendedor_id, company, phone, password } = body

  if (!email || !name || !role) {
    throw createError({ statusCode: 400, message: 'Dados incompletos: Nome, Email e Nível de Acesso são obrigatórios.' })
  }

  // 3. Create the user in Supabase Auth (Admin API)
  const defaultPassword = password || 'Evastur@123'

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: defaultPassword,
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      name: name
    }
  })

  if (authError || !authData.user) {
    throw createError({ statusCode: 400, message: `Erro ao criar na Autenticação: ${authError?.message}` })
  }

  const userId = authData.user.id

  // 4. Update or Insert the Profile Record 
  // Normally triggers insert the profile, we just need to update it with the additional data since auth trigger already created it probably.
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
    // Falhou ao criar/atualizar o profile, opcionalmente deletar auth...
    throw createError({ statusCode: 500, message: `Autenticado mas erro no perfil: ${profileError.message}` })
  }

  return { success: true, user: profile, defaultPassword }
})
