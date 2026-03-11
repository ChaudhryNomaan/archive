import { createBrowserClient } from '@supabase/ssr'

// This function allows your app to talk to Supabase
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )