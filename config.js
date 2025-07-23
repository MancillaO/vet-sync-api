import dotenv from 'dotenv'
dotenv.config()

export const {
  PORT: port = '3000',
  NODE_ENV,
  logger = NODE_ENV === 'production' ? 'combined' : 'dev',
  SUPABASE_URL: supabaseUrl,
  SUPABASE_ANON_KEY: supabaseKey,
  API_KEY: apiKey,
  ALLOWED_ORIGINS: envOrigins = 'http://localhost:5173',
  allowedOrigins = envOrigins.split(',').map(origin => origin.trim())
} = process.env
