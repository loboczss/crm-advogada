import { defineEventHandler, readBody, setResponseHeaders, createError } from 'h3'
import { getDropboxAccessToken } from '../../utils/dropboxToken'

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
  const body = await readBody<{ path: string }>(event)

  if (!body?.path) {
    throw createError({ statusCode: 400, message: 'O campo "path" é obrigatório.' })
  }

  let accessToken: string
  try {
    accessToken = await getDropboxAccessToken()
  } catch (err: any) {
    throw createError({ statusCode: 500, message: err.message })
  }

  const dropboxResponse = await fetch('https://content.dropboxapi.com/2/files/download', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Dropbox-API-Arg': JSON.stringify({ path: body.path }),
    },
  })

  if (!dropboxResponse.ok) {
    const errorText = await dropboxResponse.text()
    throw createError({
      statusCode: dropboxResponse.status,
      message: `Erro ao baixar arquivo do Dropbox: ${errorText}`,
    })
  }

  // Repassa Content-Type e Content-Disposition do Dropbox
  const contentType = dropboxResponse.headers.get('Content-Type') || 'application/octet-stream'
  const contentDisposition = dropboxResponse.headers.get('Content-Disposition') || `attachment; filename="${body.path.split('/').pop()}"`
  const dropboxApiResult = dropboxResponse.headers.get('dropbox-api-result')

  setResponseHeaders(event, {
    'Content-Type': contentType,
    'Content-Disposition': contentDisposition,
    ...(dropboxApiResult ? { 'dropbox-api-result': dropboxApiResult } : {}),
  })

  // Retorna o buffer binário
  const arrayBuffer = await dropboxResponse.arrayBuffer()
  return Buffer.from(arrayBuffer)
})
