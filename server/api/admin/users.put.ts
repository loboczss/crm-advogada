import { defineEventHandler, createError, readBody } from 'h3'
import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import type { Profile } from '../../../shared/types/profile'

export default defineEventHandler(async (event) => {
  const supabaseClient = await serverSupabaseUser(event)
  const supabaseAdmin = serverSupabaseServiceRole(event)

  if (!supabaseClient?.sub) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const { data: currentUser } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', supabaseClient.sub)
    .single()

  if (!currentUser || currentUser.role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Forbidden: Admin access required'
    })
  }

  const body = await readBody(event)
  const { id, name, role } = body

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'User ID is required'
    })
  }

  const updateData: Partial<Profile> = {}
  if (name !== undefined) updateData.name = name
  if (role !== undefined) {
    if (!['admin', 'vendedor', 'user'].includes(role)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid role'
      })
    }
    updateData.role = role
  }

  const { data: updatedUser, error } = await supabaseAdmin
    .from('profiles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[admin/users] Erro ao atualizar usuário:', error)
    throw createError({ statusCode: 500, message: 'Erro interno ao atualizar usuário.' })
  }

  return updatedUser as Profile
})
