import { userModel } from '#models/userModel.js'
import { validateUser } from '#schemas/userSchema.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

export class AuthController {
  static async register (req, res) {
    const { data, error } = validateUser(req.body)

    if (error) {
      return res.status(422).json({ error: JSON.parse(error.message) })
    }

    const { email } = data

    try {
      const existingUser = await userModel.getAllUsers({ email })
      if (existingUser.length > 0) {
        return res.status(409).json({ message: 'Email already registered' })
      }

      const newUserArr = await userModel.createUser({ input: data })
      const newUser = newUserArr[0]

      const payload = {
        id: newUser.id,
        email: newUser.email,
        nombre: newUser.nombre,
        apellido: newUser.apellido
      }

      const accessToken = jwt.sign(
        payload,
        newUser.jwt_secret,
        { expiresIn: '15m' }
      )

      const refreshToken = jwt.sign(
        { id: newUser.id },
        newUser.jwt_secret,
        { expiresIn: '7d' }
      )

      await userModel.updateRefreshToken({ id: newUser.id, refresh_token: refreshToken })

      const userData = {
        id: newUser.id,
        email: newUser.email,
        nombre: newUser.nombre,
        apellido: newUser.apellido
      }

      res.status(201).json({
        accessToken,
        refreshToken,
        userData,
        expiresIn: '15m'
      })
    } catch (e) {
      console.error(e)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  static async login (req, res) {
    const { email, password } = req.body

    try {
      const user = await userModel.getAllUsers({ email })

      if (user.length === 0) {
        return res.status(404).json({ message: 'Email not found' })
      }

      if (!user[0].activo) {
        return res.status(401).json({ message: 'User is not active' })
      }

      const userPassword = user[0].password
      const isValidPassword = await bcrypt.compare(password, userPassword)

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid password' })
      }

      // Generar JWT secret único para el usuario si no existe
      let userJwtSecret = user[0].jwt_secret
      if (!userJwtSecret) {
        userJwtSecret = crypto.randomBytes(64).toString('hex')
        await userModel.updateUserSecret({ id: user[0].id, jwt_secret: userJwtSecret })
      }

      const payload = {
        id: user[0].id,
        email: user[0].email,
        nombre: user[0].nombre,
        apellido: user[0].apellido
      }

      // Generar access token (corta duración)
      const accessToken = jwt.sign(
        payload,
        userJwtSecret,
        { expiresIn: '15m' }
      )

      // Generar refresh token (larga duración)
      const refreshToken = jwt.sign(
        { id: user[0].id },
        userJwtSecret,
        { expiresIn: '7d' }
      )

      // Guardar refresh token en la base de datos
      await userModel.updateRefreshToken({ id: user[0].id, refresh_token: refreshToken })

      const userData = {
        id: user[0].id,
        email: user[0].email,
        nombre: user[0].nombre,
        apellido: user[0].apellido
      }

      res.json({
        accessToken,
        refreshToken,
        userData,
        expiresIn: '15m'
      })
    } catch (e) {
      console.error(e)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  static async refreshToken (req, res) {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not provided' })
    }

    try {
      // Buscar usuario por refresh token
      const user = await userModel.getUserByRefreshToken({ refresh_token: refreshToken })

      if (user.length === 0) {
        return res.status(403).json({ message: 'Invalid refresh token' })
      }

      const userData = user[0]

      // Verificar el refresh token con el JWT secret del usuario
      jwt.verify(refreshToken, userData.jwt_secret, async (err, decoded) => {
        if (err) {
          console.error('Refresh token verification error:', err.message)
          return res.status(403).json({ message: 'Invalid or expired refresh token' })
        }

        // Verificar que el usuario sigue activo
        if (!userData.activo) {
          return res.status(401).json({ message: 'User is not active' })
        }

        const payload = {
          id: userData.id,
          email: userData.email,
          nombre: userData.nombre,
          apellido: userData.apellido
        }

        // Generar nuevo access token
        const newAccessToken = jwt.sign(
          payload,
          userData.jwt_secret,
          { expiresIn: '15m' }
        )

        // Opcional: Generar nuevo refresh token (rotación de tokens)
        const newRefreshToken = jwt.sign(
          { id: userData.id },
          userData.jwt_secret,
          { expiresIn: '7d' }
        )

        // Actualizar refresh token en la base de datos
        await userModel.updateRefreshToken({ id: userData.id, refresh_token: newRefreshToken })

        res.json({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: '15m'
        })
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  static async logout (req, res) {
    try {
      // Get the authenticated user from the request
      const userId = req.user.id

      // Clear the refresh token for the user
      await userModel.updateRefreshToken({ id: userId, refresh_token: null })

      res.json({ message: 'Logout successful' })
    } catch (error) {
      console.error('Logout error:', error)
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

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid password' })
      }

      // Usar el JWT secret del usuario
      let userJwtSecret = user[0].jwt_secret
      if (!userJwtSecret) {
        userJwtSecret = crypto.randomBytes(64).toString('hex')
        await userModel.updateUserSecret({ id: user[0].id, jwt_secret: userJwtSecret })
      }

      const payload = {
        id: user[0].id,
        email: user[0].email,
        nombre: user[0].nombre
      }

      const token = jwt.sign(
        payload,
        userJwtSecret,
        { expiresIn: expiration }
      )

      res.json({ token, expiration })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
}
