import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tnbwrmpufmdxfebcvwcp.supabase.co'
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_gnz0H8l_7340hnfZTVRRLA_0Osn4LCo'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
