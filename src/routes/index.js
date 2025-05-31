import { Router } from 'express'
import { authenticateToken } from '../middlewares/auth.js'
import { userRouter } from './userRouter.js'
import { authRouter } from './authRouter.js'
import { petRouter } from './petRouter.js'
import { speciesRouter } from './speciesRouter.js'
import { breedsRouter } from './breedsRouter.js'
import { vetRouter } from './vetRouter.js'
import { scheduleRouter } from './scheduleRouter.js'
import { servicesRouter } from './servicesRouter.js'
import { categoriesRouter } from './categoriesRouter.js'

export const router = Router()

router.use('/users', userRouter)
router.use('/auth', authRouter)

router.use(authenticateToken)

router.use('/species', speciesRouter)
router.use('/breeds', breedsRouter)
router.use('/pets', petRouter)
router.use('/vets', vetRouter)
router.use('/schedules', scheduleRouter)
router.use('/categories', categoriesRouter)
router.use('/services', servicesRouter)
