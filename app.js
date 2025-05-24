import express from 'express'
import { corsMiddleware } from './src/middlewares/cors.js'
import { userRouter } from './src/routes/userRouter.js'
import { authRouter } from './src/routes/authRouter.js'
import { port, logger } from './config.js'
import morgan from 'morgan'

const app = express()

app.use(express.json())
app.disable('x-powered-by')
app.use(morgan(logger))
app.use(corsMiddleware())

app.use('/api/users', userRouter)
app.use('/auth', authRouter)

app.listen(port, () => {
  console.log(`\nServer running on port ${port}\n`)
})
