import { validateUser, validatePartialUser } from '../schemas/userSchema.js'
import { userModel } from '../models/userModel.js'

export class UserController {
  static async createUser (req, res) {
    const result = validateUser(req.body)

    if (result.error){
      return res.status(422).json({ error: JSON.parse(result.error.message   ) })
    }

    try {
      const user = await userModel.create({ input: result.data })
      return res.status(201).json(user)
    } catch (error) {
      console.log(error)
      return res.status(500).json({ error: error.message })
    }
  }

  static async getAllUsers (req, res) {
    const { email } = req.query

    const users = await userModel.getAll({ email })

    if (users.length === 0){ // TODO: Cambiar validacion dependiendo de la respuesta
      return res.status(404).json({ error: 'Users not found' })
    }
    res.json(users)
  }

  static async getById (req, res) {
    const { id } = req.params

    const user = await userModel.getById({ id })

    if (!user){
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  }

  static async updateUser (req, res){
    const { id } = req.params
    const result = validatePartialUser(req.body)

    if (result.error){
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    const updatedUser = await userModel.update({ id, input: result.data })

    if (!updatedUser){
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(updatedUser)
  }

  static async deleteUser (req, res){
    const { id } = req.params

    const deletedUser = await userModel.delete({ id })

    if (!deletedUser){
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(deletedUser)
  }
}
