import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

interface VendaNotificationPayload {
  id: number
  contato_id: string
  contact_name?: string | null
  valor_venda?: number | null
  status?: string | null
  vendedor_id?: number | null
}

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function formatCurrency(value?: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'não informado'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export async function notifyVendedorForSale(
  event: H3Event,
  venda: VendaNotificationPayload,
  action: 'created' | 'reassigned' = 'created',
  createdByUserId?: string
) {
  const vendedorId = toNumberOrNull(venda.vendedor_id)
  const supabaseAdmin = serverSupabaseServiceRole(event)

  const recipientIds = new Set<string>()

  if (vendedorId != null) {
    const { data: vendedores, error: vendedoresError } = await supabaseAdmin
      .from('profiles')
      .select('id, name')
      .eq('role', 'vendedor')
      .eq('vendedor_id', vendedorId)

    if (vendedoresError) {
      console.error('[vendas-notifications] Erro ao buscar vendedor por vendedor_id:', vendedoresError)
    } else {
      for (const vendedor of vendedores ?? []) {
        recipientIds.add(vendedor.id)
      }
    }
  }

  if (action === 'created') {
    if (createdByUserId) {
      recipientIds.add(createdByUserId)
    }

    const { data: admins, error: adminsError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'admin')

    if (adminsError) {
      console.error('[vendas-notifications] Erro ao buscar administradores:', adminsError)
    } else {
      for (const admin of admins ?? []) {
        recipientIds.add(admin.id)
      }
    }
  }

  if (recipientIds.size === 0) return

  const leadRef = venda.contact_name?.trim() || venda.contato_id
  const valorVenda = formatCurrency(venda.valor_venda)

  const { data: vendedorProfiles } = vendedorId != null
    ? await supabaseAdmin
      .from('profiles')
      .select('name')
      .eq('role', 'vendedor')
      .eq('vendedor_id', vendedorId)
    : { data: null }

  const vendedorNames = (vendedorProfiles ?? [])
    .map((profile) => profile.name?.trim())
    .filter((name): name is string => Boolean(name))

  const vendedorLabel = vendedorNames.length > 0
    ? vendedorNames.join(', ')
    : (vendedorId != null ? `ID ${vendedorId}` : 'não informado')

  const title = action === 'reassigned' ? 'Venda atribuída a você' : 'Nova venda vinculada'
  const message =
    action === 'reassigned'
      ? `A venda #${venda.id} foi atribuída ao vendedor ${vendedorLabel}. Cliente: ${leadRef}. Valor: ${valorVenda}.`
      : `A venda #${venda.id} foi registrada para o vendedor ${vendedorLabel}. Cliente: ${leadRef}. Valor: ${valorVenda}.`

  const notifications = Array.from(recipientIds).map((userId) => ({
    user_id: userId,
    title,
    message,
    type: 'info' as const,
    metadata: {
      venda_id: venda.id,
      contato_id: venda.contato_id,
      vendedor_id: vendedorId,
      vendedor_nome: vendedorNames.length > 0 ? vendedorNames.join(', ') : null,
      status: venda.status ?? null,
      action,
    },
    is_read: false,
  }))

  const { error: notificationError } = await supabaseAdmin
    .from('notifications')
    .insert(notifications)

  if (notificationError) {
    console.error('[vendas-notifications] Erro ao inserir notificações de venda (payload completo):', notificationError)

    const minimalNotifications = Array.from(recipientIds).map((userId) => ({
      user_id: userId,
      title,
      message,
    }))

    const { error: fallbackError } = await supabaseAdmin
      .from('notifications')
      .insert(minimalNotifications)

    if (fallbackError) {
      console.error('[vendas-notifications] Erro ao inserir notificações de venda (fallback):', fallbackError)
    }
  }
}
