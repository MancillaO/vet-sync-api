import { Router } from 'express'
import { authenticateToken } from '../middlewares/auth.js'
import { userRouter } from './userRouter.js'
import { authRouter } from './authRouter.js'
import { petRouter } from './petRouter.js'
import { speciesRouter } from './speciesRouter.js'

export const router = Router()

router.use('/users', userRouter)
router.use('/auth', authRouter)
router.use('/species', authenticateToken, speciesRouter)
router.use('/pets', authenticateToken, petRouter)
