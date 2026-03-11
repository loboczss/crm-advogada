export interface Profile {
  id: string
  email: string
  name: string
  role: 'admin' | 'vendedor' | 'user'
  phone?: string
  company?: string
  avatar_url?: string | null
  vendedor_id?: number | null
  created_at: string
}
