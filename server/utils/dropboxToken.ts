/**
 * Troca o refresh_token do Dropbox por um access_token válido.
 * O token retornado é válido por ~4 horas e é cacheado em memória por 3.5 horas.
 */
let cachedToken: { token: string; expiresAt: number } | null = null

export async function getDropboxAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

  const clientId = process.env.DROPBOX_CLIENT_ID
  const clientSecret = process.env.DROPBOX_CLIENT_SECRET
  const refreshToken = process.env.DROPBOX_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Variáveis de ambiente do Dropbox não configuradas (DROPBOX_CLIENT_ID, DROPBOX_CLIENT_SECRET, DROPBOX_REFRESH_TOKEN).')
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  })

  const response = await fetch('https://api.dropbox.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Falha ao obter access_token do Dropbox: ${response.status} – ${text}`)
  }

  const data = await response.json() as { access_token: string }

  // Cache for 3.5 hours (token is valid for 4 hours)
  cachedToken = { token: data.access_token, expiresAt: Date.now() + 3.5 * 60 * 60 * 1000 }

  return data.access_token
}
