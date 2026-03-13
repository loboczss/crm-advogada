import { defineEventHandler } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { NotificationDTO } from '../../shared/types/NotificationDTO'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user?.sub) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const client = serverSupabaseServiceRole(event)
  
  const { data, error } = await client
    .from('notifications')
    .select('*')
    .eq('user_id', user.sub)
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }

  return data as NotificationDTO[]
})
