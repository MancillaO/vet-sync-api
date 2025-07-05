import { Router } from 'express'
import { PetController } from '#controllers/petController.js'
import { PetImageController } from '#controllers/petImageController.js'
import { authenticateToken } from '#middlewares/auth.js'
import { imageMiddleware } from '../middlewares/multer.js'

export const petRouter = Router()

// Public GET routes
petRouter.get('/', PetController.getAllPets)
petRouter.get('/detail', PetController.getDetailedPet)
petRouter.get('/user/:userId', PetController.getByUser)
petRouter.get('/:id', PetController.getById)

// Apply authentication middleware for all subsequent routes
petRouter.use(authenticateToken)

// Protected routes (POST, PATCH, DELETE)
petRouter.post('/', PetController.addPet)
petRouter.patch('/:id', PetController.updatePet)
petRouter.delete('/:id', PetController.deletePet)

// Protected image routes
petRouter.post('/:id/imagen', imageMiddleware, PetImageController.uploadImage)
petRouter.delete('/:id/imagen', PetImageController.removeImage)
petRouter.get('/:id/imagen', PetImageController.getImageInfo)
