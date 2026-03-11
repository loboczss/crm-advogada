import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import { getDropboxAccessToken } from '../../utils/dropboxToken'

export default defineEventHandler(async (event) => {
  // 1. Authenticate user
  const user = await serverSupabaseUser(event)
  if (!user?.sub) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  // 2. Read multipart data
  const parts = await readMultipartFormData(event)
  if (!parts || parts.length === 0) {
    throw createError({ statusCode: 400, message: 'Nenhuma imagem enviada.' })
  }

  const filePart = parts.find(p => p.name === 'file' || p.name === 'avatar')
  if (!filePart || !filePart.data || !filePart.filename) {
    throw createError({ statusCode: 400, message: 'Arquivo de imagem inválido ou ausente.' })
  }

  // Generate safe filename and path
  const ext = filePart.filename.split('.').pop()?.toLowerCase() || 'jpg'
  const validExts = ['jpg', 'jpeg', 'png', 'gif', 'webp']
  if (!validExts.includes(ext)) {
    throw createError({ statusCode: 400, message: 'Formato de imagem não suportado. Use JPG, PNG, GIF ou WEBP.' })
  }

  const dropboxPath = `/app/site/crm/cliente/${user.sub}/avatar/avatar-${Date.now()}.${ext}`

  // 3. Upload to Dropbox
  let accessToken: string
  try {
    accessToken = await getDropboxAccessToken()
  } catch (err: any) {
    throw createError({ statusCode: 500, message: `Erro de Token: ${err.message}` })
  }

  const dropboxApiArg = {
    path: dropboxPath,
    mode: 'add',
    autorename: true,
    mute: false,
    strict_conflict: false,
  }

  // Ensure user folders exist (fails silently if they already exist)
  await fetch('https://api.dropboxapi.com/2/files/create_folder_batch', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paths: [
        `/app/site/crm/cliente/${user.sub}/avatar`,
        `/app/site/crm/cliente/${user.sub}/documentos`,
        `/app/site/crm/cliente/${user.sub}/backup`
      ],
      autorename: false,
      force_async: false
    })
  }).catch(() => {}) // We ignore errors (e.g., if folders already exist)

  const uploadResponse = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify(dropboxApiArg),
    },
    body: new Uint8Array(filePart.data),
  })

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text()
    throw createError({ statusCode: uploadResponse.status, message: `Erro de Upload no Dropbox: ${errorText}` })
  }

  const uploadMetadata = await uploadResponse.json()

  // 4. Create Shared Link in Dropbox
  const linkResponse = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      path: uploadMetadata.path_display,
      settings: {
        requested_visibility: 'public',
        audience: 'public',
        access: 'viewer'
      }
    })
  })

  if (!linkResponse.ok) {
    // Pode falhar se o link já existir, mas como geramos com timestamp, deve ser sempre novo.
    const errorText = await linkResponse.text()
    throw createError({ statusCode: linkResponse.status, message: `Erro ao gerar link público: ${errorText}` })
  }

  const linkData = await linkResponse.json()
  
  // Trocar ?dl=0 para ?raw=1 para renderização direta em <img> tags
  const sharedUrl = linkData.url.replace('?dl=0', '') + (linkData.url.includes('?') ? '&raw=1' : '?raw=1')

  // 5. Save to Supabase Profiles Table
  const supabaseAdmin = serverSupabaseServiceRole(event)
  const { error: dbError } = await supabaseAdmin
    .from('profiles')
    .update({ avatar_url: sharedUrl })
    .eq('id', user.sub)

  if (dbError) {
    throw createError({ statusCode: 500, message: `Erro ao salvar no banco: ${dbError.message}` })
  }

  return {
    success: true,
    avatar_url: sharedUrl
  }
})
