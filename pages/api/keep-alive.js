import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    )
    
    await supabase.from('profiles').select('count').limit(1)
    res.status(200).json({ status: 'Database ping successful' })
  } catch (error) {
    res.status(500).json({ error: 'Ping failed' })
  }
}
