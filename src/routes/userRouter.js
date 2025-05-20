import { Router } from 'express'
import { userController } from '../controllers/userController.js'

export const userRouter = Router()

userRouter.post('/', userController.createUser)

userRouter.get('/', userController.getAllUsers)
userRouter.get('/:id', userController.getUserById)

userRouter.put('/:id', userController.updateUser)
userRouter.delete('/:id', userController.deleteUser)
