export interface Profile {
  id: string
  email: string
  name: string
  role: 'admin' | 'vendedor' | 'user'
  phone?: string
  company?: string
  created_at: string
}
