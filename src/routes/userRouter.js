import { Router } from 'express'
import { UserController } from '../controllers/userController.js'

export const userRouter = Router()

userRouter.post('/', UserController.createUser)

userRouter.get('/', UserController.getAllUsers)
userRouter.get('/:id', UserController.getById)

userRouter.patch('/:id', UserController.updateUser)
userRouter.delete('/:id', UserController.deleteUser)
