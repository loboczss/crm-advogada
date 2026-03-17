import { defineEventHandler, readBody, setResponseHeaders, createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { getDropboxAccessToken } from '../../utils/dropboxToken'
import { assertDropboxPathAccess, throwSanitizedInternalError } from '../../utils/security'

/**
 * POST /api/dropbox/download
 *
 * Body:
 * {
 *   path: string   // Caminho do arquivo no Dropbox, ex: "/pasta/arquivo.pdf"
 * }
 *
 * Retorna o arquivo em binário com o Content-Type correto.
 * O body binário pode ser encaminhado diretamente ao client.
 */
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user?.sub) throw createError({ statusCode: 401, message: 'Não autorizado.' })

  const body = await readBody<{ path: string }>(event)

  if (!body?.path) {
    throw createError({ statusCode: 400, message: 'O campo "path" é obrigatório.' })
  }

  const normalizedPath = await assertDropboxPathAccess(event, user.sub, body.path)

  let accessToken: string
  try {
    accessToken = await getDropboxAccessToken()
  } catch (err: any) {
    throwSanitizedInternalError('dropbox/download-token', err, 'Erro interno ao autenticar com o provedor de arquivos.')
  }

  const dropboxResponse = await fetch('https://content.dropboxapi.com/2/files/download', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Dropbox-API-Arg': JSON.stringify({ path: normalizedPath }),
    },
  })

  if (!dropboxResponse.ok) {
    const errorText = await dropboxResponse.text()
    console.error('[dropbox/download] Erro na API Dropbox:', dropboxResponse.status, errorText)
    throw createError({ statusCode: 502, message: 'Erro ao baixar arquivo do Dropbox.' })
  }

  // Repassa Content-Type e Content-Disposition do Dropbox
  const contentType = dropboxResponse.headers.get('Content-Type') || 'application/octet-stream'
  const contentDisposition = dropboxResponse.headers.get('Content-Disposition') || `attachment; filename="${normalizedPath.split('/').pop()}"`

  setResponseHeaders(event, {
    'Content-Type': contentType,
    'Content-Disposition': contentDisposition,
  })

  // Retorna o buffer binário
  const arrayBuffer = await dropboxResponse.arrayBuffer()
  return Buffer.from(arrayBuffer)
})
