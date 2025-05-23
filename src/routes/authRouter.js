import { Router } from 'express'
import { AuthController } from '../controllers/authController.js'

export const authRouter = Router()

authRouter.post('/login', AuthController.login)
authRouter.post('/token', AuthController.customToken)
