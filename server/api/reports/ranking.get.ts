import { serverSupabaseClient } from '#supabase/server'

// IDs de vendedores a ignorar no ranking (IDs inválidos ou de teste)
const IGNORED_VENDOR_IDS = new Set(['626'])

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const { startDate, endDate } = getQuery(event)

    if (!startDate || !endDate) {
        throw createError({ statusCode: 400, statusMessage: 'startDate and endDate are required' })
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PASSO 1: Descobrir o nome mais recente de cada vendedor_id (em TODA a tabela,
    //           não apenas no período — para garantir o nome correto mesmo que o
    //           vendedor não tenha mensagens no período filtrado)
    // ─────────────────────────────────────────────────────────────────────────
    let allNamesData: { vendedor_id: string | null; vendedor: string | null; created_at: string }[] = []
    let namesPage = 0
    while (true) {
        const { data, error } = await client
            .from('todas_mensagens_whatsapp')
            .select('vendedor_id, vendedor, created_at')
            .not('vendedor_id', 'is', null)
            .not('vendedor', 'is', null)
            .order('created_at', { ascending: false })
            .range(namesPage * 1000, (namesPage + 1) * 1000 - 1)

        if (error) throw createError({ statusCode: 500, statusMessage: error.message })
        if (!data || data.length === 0) break

        allNamesData.push(...data)
        if (data.length < 1000) break
        namesPage++
    }

    // Mapeia vendedor_id → nome mais recente (o primeiro encontrado, já que veio ordenado por desc)
    const idToName = new Map<string, string>()
    // Mapeia nome normalizado → vendedor_id (para associar as vendas que não têm vendedor_id)
    const normalizedNameToId = new Map<string, string>()

    for (const row of allNamesData) {
        const vid = String(row.vendedor_id!)
        const nome = row.vendedor!.trim()
        const nomeNorm = nome.toLowerCase()

        if (!idToName.has(vid)) {
            idToName.set(vid, nome)
        }
        // Registra todos os nomes históricos do vendedor para lookup reverso
        if (!normalizedNameToId.has(nomeNorm)) {
            normalizedNameToId.set(nomeNorm, vid)
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PASSO 2: Buscar mensagens do período, agrupando por vendedor_id
    // ─────────────────────────────────────────────────────────────────────────
    let allMessages: { vendedor_id: string | null; telefone: string | null }[] = []
    let msgPage = 0
    while (true) {
        const { data, error } = await client
            .from('todas_mensagens_whatsapp')
            .select('vendedor_id, telefone')
            .gte('created_at', startDate as string)
            .lte('created_at', endDate as string)
            .range(msgPage * 1000, (msgPage + 1) * 1000 - 1)

        if (error) throw createError({ statusCode: 500, statusMessage: error.message })
        if (!data || data.length === 0) break

        allMessages.push(...data)
        if (data.length < 1000) break
        msgPage++
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PASSO 3: Buscar vendas do período
    // ─────────────────────────────────────────────────────────────────────────
    let allSales: { vendedor_id: number | null; vendedor: string | null; valor_venda: number | null }[] = []
    let salesPage = 0
    while (true) {
        const { data, error } = await client
            .from('historico_vendas_evastur')
            .select('vendedor_id, vendedor, valor_venda')
            .gte('created_at', startDate as string)
            .lte('created_at', endDate as string)
            .range(salesPage * 1000, (salesPage + 1) * 1000 - 1)

        if (error) throw createError({ statusCode: 500, statusMessage: error.message })
        if (!data || data.length === 0) break

        allSales.push(...data)
        if (data.length < 1000) break
        salesPage++
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PASSO 4: Agregar dados por vendedor_id
    // ─────────────────────────────────────────────────────────────────────────
    const sellersMap = new Map<string, {
        uniquePhones: Set<string>;
        vendas: number;
        valorTotal: number;
    }>()

    // Agregar mensagens (clientes atendidos) por vendedor_id
    for (const msg of allMessages) {
        const vid = msg.vendedor_id ? String(msg.vendedor_id).trim() : null
        if (!vid || !msg.telefone) continue
        if (IGNORED_VENDOR_IDS.has(vid)) continue

        if (!sellersMap.has(vid)) {
            sellersMap.set(vid, { uniquePhones: new Set(), vendas: 0, valorTotal: 0 })
        }
        sellersMap.get(vid)!.uniquePhones.add(msg.telefone)
    }

    // Agregar vendas por vendedor_id
    // Se a venda tem vendedor_id (integer), usa direto
    // Se não tem (NULL), tenta resolver via nome normalizado
    for (const sale of allSales) {
        let vid: string | null = null

        if (sale.vendedor_id != null) {
            vid = String(sale.vendedor_id)
        } else if (sale.vendedor) {
            // Tenta encontrar o ID pelo nome (histórico de nomes)
            const nomeNorm = sale.vendedor.trim().toLowerCase()
            vid = normalizedNameToId.get(nomeNorm) ?? null
        }

        if (!vid) continue
        if (IGNORED_VENDOR_IDS.has(vid)) continue

        if (!sellersMap.has(vid)) {
            sellersMap.set(vid, { uniquePhones: new Set(), vendas: 0, valorTotal: 0 })
        }

        const stats = sellersMap.get(vid)!
        stats.vendas++
        stats.valorTotal += Number(sale.valor_venda) || 0
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PASSO 5: Formatar e ordenar o ranking
    //           Usa o nome mais recente do vendedor (de idToName)
    //           Se não encontrar (ex: vendedor_id só em historico_vendas), usa o
    //           nome da venda como fallback
    // ─────────────────────────────────────────────────────────────────────────
    const ranking = Array.from(sellersMap.entries())
        .map(([vid, stats]) => {
            const nome = idToName.get(vid) ?? `Vendedor ${vid}`
            const clientes = stats.uniquePhones.size
            const vendas = stats.vendas
            const conversao = clientes > 0 ? (vendas / clientes) * 100 : 0

            return {
                id: vid,
                nome,
                clientes,
                vendas,
                valor: stats.valorTotal,
                conversao
            }
        })
        // Filtra vendedores sem nenhuma atividade no período
        .filter(seller => seller.clientes > 0 || seller.vendas > 0)

    ranking.sort((a, b) => b.valor - a.valor || b.vendas - a.vendas)

    return { ranking }
})
