import { JWT_SECRET } from '../../config.js'
import jwt from 'jsonwebtoken'

export const authenticateToken = (req, res, next) => {
  const token = req.headers.token

  if (!token) {
    return res.status(401).json({ message: 'Token not provided' })
  }

  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) {
      console.error('JWT verification error:', err.message)
      return res.status(403).json({ message: 'Invalid token' })
    }
    req.user = userPayload
    next()
  })
}
