import dotenv from 'dotenv'
dotenv.config()

export const {
  PORT: port = '3000',
  NODE_ENV,
  logger = NODE_ENV === 'production' ? 'combined' : 'dev',
  SUPABASE_URL: supabaseUrl,
  SUPABASE_ANON_KEY: supabaseKey
} = process.env
