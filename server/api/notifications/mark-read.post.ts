import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { UpdateNotificationDTO } from '../../../shared/types/NotificationDTO'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user?.sub) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const { id } = await readBody(event)
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Missing notification ID'
    })
  }

  const client = serverSupabaseServiceRole(event)
  
  const { error } = await client
    .from('notifications')
    .update({ is_read: true } as UpdateNotificationDTO)
    .eq('id', id)
    .eq('user_id', user.sub)

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }

  return { success: true }
})
