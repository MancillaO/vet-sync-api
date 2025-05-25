import express from 'express'
import morgan from 'morgan'
import { corsMiddleware } from './src/middlewares/cors.js'
import { router } from './src/routes/index.js'
import { port, logger } from './config.js'

const app = express()

app.use(express.json())
app.disable('x-powered-by')
app.use(morgan(logger))
app.use(corsMiddleware())

app.use(router)

app.listen(port, () => {
  console.log(`\nServer running on port ${port}\n`)
})
