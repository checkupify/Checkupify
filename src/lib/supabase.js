import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lguoussmsusadvmexjkb.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndW91c3Ntc3VzYWR2bWV4amtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3Njc1OTcsImV4cCI6MjA5MDM0MzU5N30.Mq6nW2ItZqywuIbVeOUR9HQOglZOL5Wm0uSFwT6hfjw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

