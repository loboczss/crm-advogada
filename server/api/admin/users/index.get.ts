import { defineEventHandler, createError } from 'h3'
import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import type { Profile } from '../../../../shared/types/profile'

export default defineEventHandler(async (event) => {
  // 1. Verify Authentication and Admin Role
  const user = await serverSupabaseUser(event)
  if (!user?.sub) {
    throw createError({ statusCode: 401, message: 'Não autorizado.' })
  }

  const supabaseClient = serverSupabaseServiceRole(event)

  const { data: currentUserProfile } = await supabaseClient
    .from('profiles')
    .select('role')
    .eq('id', user.sub)
    .single()

  if (currentUserProfile?.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Acesso negado. Apenas administradores.' })
  }

  // 2. Fetch all profiles
  const { data: users, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/users] Erro ao buscar usuários:', error)
    throw createError({ statusCode: 500, message: 'Erro interno ao buscar usuários.' })
  }

  return users as Profile[]
})
