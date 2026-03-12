import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // 1. Params and auth
  const userIdToUpdate = event.context.params?.id
  if (!userIdToUpdate) {
    throw createError({ statusCode: 400, message: 'ID do usuário não fornecido na URL.' })
  }

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

  // 2. Read body
  const body = await readBody(event)
  const { role, vendedor_id, company, phone, name } = body

  // We do not allow changing email through this endpoint for now as it disrupts Auth.
  
  const updates: any = { updated_at: new Date().toISOString() }
  if (role !== undefined) updates.role = role
  if (vendedor_id !== undefined) updates.vendedor_id = vendedor_id
  if (company !== undefined) updates.company = company
  if (phone !== undefined) updates.phone = phone
  if (name !== undefined) updates.name = name

  const { data: updatedProfile, error: updateError } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', userIdToUpdate)
    .select()
    .single()

  if (updateError) {
    throw createError({ statusCode: 500, message: `Erro ao atualizar usuário: ${updateError.message}` })
  }

  // Optionally update auth user_metadata if name changed
  if (name) {
    await supabaseAdmin.auth.admin.updateUserById(userIdToUpdate, {
      user_metadata: { name }
    })
  }

  return { success: true, user: updatedProfile }
})
