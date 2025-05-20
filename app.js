import express from 'express'
import { corsMiddleware } from './src/middlewares/cors'
import { port, logger } from './config.js'
import morgan from 'morgan'

const app = express()

app.use(express.json())
app.disable('x-powered-by')
app.use(morgan(logger))
app.use(corsMiddleware())

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
