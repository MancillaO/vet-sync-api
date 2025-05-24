import { userModel } from '../models/userModel.js'
import { JWT_SECRET } from '../../config.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export class AuthController {
  static async login (req, res) {
    const { email, password } = req.body

    try {
      const user = await userModel.getAllUsers({ email })

      if (user.length === 0) {
        return res.status(404).json({ message: 'Email not found' })
      }

      if (!user[0].is_active) {
        return res.status(401).json({ message: 'User is not active' })
      }

      const userPassword = user[0].password

      const isValidPassword = await bcrypt.compare(password, userPassword)

      if (!isValidPassword) return res.status(401).json({ message: 'Invalid password' })

      const payload = {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name
      }

      const token = jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '1h' }
      )

      const userData = {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name
      }

      res.json({ token, userData })
    } catch (e) {
      console.error(e)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  static async customToken (req, res) {
    const { email, password, expiration } = req.body

    try {
      const user = await userModel.getAllUsers({ email })
      if (user.length === 0) {
        return res.status(404).json({ message: 'Email not found' })
      }
      const userPassword = user[0].password

      const isValidPassword = await bcrypt.compare(password, userPassword)

      if (!isValidPassword) return res.status(401).json({ message: 'Invalid password' })

      const payload = {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name
      }

      const token = jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: expiration }
      )

      res.json({ token, expiration })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
}
