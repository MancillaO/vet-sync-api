import { Router } from 'express'
import { ServiceController } from '../controllers/serviceController.js'

export const servicesRouter = Router()

servicesRouter.get('/', ServiceController.getAllServices)
servicesRouter.get('/:id', ServiceController.getById)

servicesRouter.post('/', ServiceController.addService)

servicesRouter.patch('/:id', ServiceController.updateService)
servicesRouter.delete('/:id', ServiceController.deleteService)
