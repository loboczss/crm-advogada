import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { getDropboxAccessToken } from '../../utils/dropboxToken'
import { assertDropboxPathAccess, throwSanitizedInternalError } from '../../utils/security'

/**
 * POST /api/dropbox/upload
 *
 * Aceita multipart/form-data com os campos:
 * - file: Blob / File  (obrigatório)
 * - path: string       (obrigatório, ex: "/pasta/arquivo.pdf")
 * - mode: string       (opcional, padrão: "add" | "overwrite" | "update")
 * - autorename: string (opcional, "true" | "false", padrão: "true")
 *
 * Retorna o metadata do arquivo criado no Dropbox.
 */
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user?.sub) throw createError({ statusCode: 401, message: 'Não autorizado.' })

  const parts = await readMultipartFormData(event)

  if (!parts || parts.length === 0) {
    throw createError({ statusCode: 400, message: 'Nenhum dado enviado. Use multipart/form-data com os campos "path" e "file".' })
  }

  // Extrai campos do multipart
  let fileData: Buffer | undefined
  let fileName = 'upload'
  let dropboxPath: string | undefined
  let mode = 'add'
  let autorename = true

  for (const part of parts) {
    if (part.name === 'file') {
      fileData = part.data
      fileName = part.filename || 'upload'
    } else if (part.name === 'path') {
      dropboxPath = part.data.toString('utf-8').trim()
    } else if (part.name === 'mode') {
      mode = part.data.toString('utf-8').trim()
    } else if (part.name === 'autorename') {
      autorename = part.data.toString('utf-8').trim() !== 'false'
    }
  }

  if (!fileData) {
    throw createError({ statusCode: 400, message: 'Campo "file" é obrigatório.' })
  }

  if (!dropboxPath) {
    throw createError({ statusCode: 400, message: 'Campo "path" é obrigatório (ex: "/pasta/arquivo.pdf").' })
  }

  if (!['add', 'overwrite'].includes(mode)) {
    throw createError({ statusCode: 400, message: 'Modo de upload inválido.' })
  }

  const normalizedPath = await assertDropboxPathAccess(event, user.sub, dropboxPath)

  const MAX_FILE_SIZE = 15 * 1024 * 1024
  if (fileData.length > MAX_FILE_SIZE) {
    throw createError({ statusCode: 413, message: 'Arquivo muito grande. O tamanho máximo é 15MB.' })
  }

  let accessToken: string
  try {
    accessToken = await getDropboxAccessToken()
  } catch (err: any) {
    throwSanitizedInternalError('dropbox/upload-token', err, 'Erro interno ao autenticar com o provedor de arquivos.')
  }

  const dropboxApiArg = {
    path: normalizedPath,
    mode,
    autorename,
    mute: false,
    strict_conflict: false,
  }

  const dropboxResponse = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify(dropboxApiArg),
    },
    body: new Uint8Array(fileData),
  })

  if (!dropboxResponse.ok) {
    const errorText = await dropboxResponse.text()
    console.error('[dropbox/upload] Erro na API Dropbox:', dropboxResponse.status, errorText)
    throw createError({ statusCode: 502, message: 'Erro ao fazer upload para o Dropbox.' })
  }

  const metadata = await dropboxResponse.json()
  return {
    id: metadata.id,
    name: metadata.name || fileName,
    path_display: metadata.path_display,
    size: metadata.size,
    client_modified: metadata.client_modified,
  }
})
