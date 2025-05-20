import dotenv from 'dotenv'
dotenv.config()

export const {
  PORT: port = '3000',
  MONGODB_URI,
  NODE_ENV,
  logger = NODE_ENV === 'production' ? 'combined' : 'dev',
  JWT_SECRET
} = process.env
