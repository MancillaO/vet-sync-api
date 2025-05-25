import { Router } from 'express'
import { userRouter } from './userRouter.js'
import { authRouter } from './authRouter.js'
import { petRouter } from './petRouter.js'

export const router = Router()

router.use('/users', userRouter)
router.use('/auth', authRouter)
router.use('/pets', petRouter)
