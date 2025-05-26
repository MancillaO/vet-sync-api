import { Router } from 'express'
import { authenticateToken } from '../middlewares/auth.js'
import { userRouter } from './userRouter.js'
import { authRouter } from './authRouter.js'
import { petRouter } from './petRouter.js'
import { speciesRouter } from './speciesRouter.js'
import { breedsRouter } from './breedsRouter.js'
import { vetRouter } from './vetRouter.js'
import { scheduleRouter } from './scheduleRouter.js'

export const router = Router()

router.use('/users', userRouter)
router.use('/auth', authRouter)
router.use('/species', authenticateToken, speciesRouter)
router.use('/breeds', authenticateToken, breedsRouter)
router.use('/pets', authenticateToken, petRouter)
router.use('/vets', authenticateToken, vetRouter)
router.use('/schedules', authenticateToken, scheduleRouter)
