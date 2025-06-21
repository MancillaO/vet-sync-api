import { Router } from 'express'
import { ServiceController } from '#controllers/serviceController.js'
import { authenticateToken } from '#middlewares/auth.js'

export const servicesRouter = Router()

servicesRouter.get('/', ServiceController.getAllServices)
servicesRouter.get('/:id', ServiceController.getById)
servicesRouter.get('/active/:active', ServiceController.getActiveServices)

servicesRouter.use(authenticateToken)

servicesRouter.post('/', ServiceController.addService)

servicesRouter.patch('/:id', ServiceController.updateService)
servicesRouter.delete('/:id', ServiceController.deleteService)
