/**
 * DTO para envio de documentos ao webhook RAG do n8n.
 */
export interface RagDocumentPayload {
    /** Conteúdo textual do documento (ex: conteúdo de um .txt ou texto extraído) */
    conteudo: string
    /** Base64 do arquivo, se aplicável (imagens, PDFs, etc.) */
    base64?: string
    /** Tipo do documento: TXT, PNG, PDF, etc. */
    tipo: 'TXT' | 'PNG' | 'PDF' | 'JPG' | 'DOCX' | string
}

export interface RagWebhookResponse {
    success: boolean
    message?: string
}
