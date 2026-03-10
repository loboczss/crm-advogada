import { defineEventHandler, createError } from 'h3'
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

  const { data: users, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }

  return users as Profile[]
})
