export interface CrmAndreaRosaDTO {
    id?: number
    created_at?: string
    contato_id: string
    nome: string | null
    nome_social: string | null
    email: string | null
    cidade: string | null
    data_nascimento: string | null
    sentimento: string | null
    urgencia: string | null
    fase_obra: string | null
    resumo_perfil: string | null
    interesses: string[] | null
    objeccoes: string[] | null
    compras_cliente: any | null
}
