import { defineEventHandler, createError } from 'h3'
import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user?.sub) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const supabaseAdmin = serverSupabaseServiceRole(event)

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.sub)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }

  if (!profile) {
    const { data: newProfile, error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: user.sub,
        email: (user.email as string) ?? '',
        name: (user['user_metadata'] as any)?.name ?? (user.email as string)?.split('@')[0] ?? '',
        role: 'user',
      })
      .select()
      .single()

    if (insertError) {
      throw createError({
        statusCode: 500,
        message: insertError.message
      })
    }

    return newProfile
  }

  return profile
})
