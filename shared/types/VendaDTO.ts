export interface Venda {
    id: number
    created_at: string
    contato_id: string
    valor_venda: number | null
    contact_name: string | null
    vendedor: string | null
    status: string | null
    tipo_venda: string | null
    forma_pagamento: string | null
    embarque: string | null
    observacao: string | null
    comissao: number | null
    data_volta: string | null
    vendedor_id: number | null
}
