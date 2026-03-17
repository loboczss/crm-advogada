import { createError, type H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

type ProfileRole = 'admin' | 'vendedor' | 'user'

export async function getActorRole(event: H3Event, userId: string, context = 'authz'): Promise<ProfileRole | null> {
  const supabaseAdmin = serverSupabaseServiceRole(event)

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error) {
    console.error(`[${context}] Erro ao buscar role do usuário:`, error)
    throw createError({ statusCode: 500, message: 'Erro interno ao validar permissões.' })
  }

  return (data?.role as ProfileRole | null) ?? null
}

export async function assertActorRole(
  event: H3Event,
  userId: string,
  allowedRoles: ProfileRole[],
  forbiddenMessage: string,
  context = 'authz'
): Promise<ProfileRole> {
  const role = await getActorRole(event, userId, context)

  if (!role || !allowedRoles.includes(role)) {
    throw createError({ statusCode: 403, message: forbiddenMessage })
  }

  return role
}

export function normalizeDropboxPath(path: string): string {
  const normalized = path.replace(/\\/g, '/').replace(/\/+/g, '/')
  return normalized.startsWith('/') ? normalized : `/${normalized}`
}

export async function assertDropboxPathAccess(event: H3Event, userId: string, rawPath: string): Promise<string> {
  const normalizedPath = normalizeDropboxPath(rawPath)

  if (normalizedPath.includes('..') || !normalizedPath.startsWith('/app/site/')) {
    throw createError({ statusCode: 400, message: 'Caminho inválido. O arquivo deve permanecer dentro de /app/site/.' })
  }

  const role = await getActorRole(event, userId, 'dropbox/authz')
  if (role === 'admin') {
    return normalizedPath
  }

  const ownBasePath = `/app/site/crm/cliente/${userId}/`
  if (!normalizedPath.startsWith(ownBasePath)) {
    throw createError({ statusCode: 403, message: 'Acesso negado ao caminho informado.' })
  }

  return normalizedPath
}

export function throwSanitizedInternalError(context: string, error: unknown, message: string, statusCode = 500): never {
  console.error(`[${context}]`, error)
  throw createError({ statusCode, message })
}

export function normalizeEvaAgentName(rawAgentName: unknown, fallback = 'master'): string {
  const agentName = typeof rawAgentName === 'string' ? rawAgentName.trim() : fallback

  if (!agentName) {
    return fallback
  }

  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(agentName)) {
    throw createError({ statusCode: 400, message: 'Nome de agente inválido.' })
  }

  return agentName
}