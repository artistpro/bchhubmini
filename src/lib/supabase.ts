import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase')
}

// Interfaz para el perfil de usuario
export interface Profile {
  id: string
  email: string
  full_name?: string
  role: string
  created_at?: string
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
