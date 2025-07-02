import { supabase } from '#databases/index.js'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

export class userModel {
  static async createUser ({ input }) {
    const { nombre, apellido, email, password, telefono, direccion } = input
    const hashedPassword = await bcrypt.hash(password, 10)

    const jwtSecret = crypto.randomBytes(64).toString('hex')

    try {
      const { data: user, error } = await supabase.from('usuarios').insert({
        nombre,
        apellido,
        email,
        telefono,
        direccion: direccion || '',
        password: hashedPassword,
        jwt_secret: jwtSecret
      }).select()

      if (error) throw new Error(error.message)

      return user
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async getAllUsers ({ email }) {
    let query = supabase.from('usuarios').select()

    if (email) {
      query = query.eq('email', email)
    }

    const { data: users, error } = await query

    if (error) throw new Error(error.message)

    return users
  }

  static async getById ({ id }) {
    const { data: user, error } = await supabase.from('usuarios').select().eq('id', id)
    if (error) throw new Error(error.message)

    return user
  }

  static async getUserByRefreshToken ({ refresh_token }) {
    try {
      const { data: user, error } = await supabase
        .from('usuarios')
        .select()
        .eq('refresh_token', refresh_token)

      if (error) throw new Error(error.message)

      return user
    } catch (error) {
      console.log(`Error al obtener usuario por refresh token: ${error.message}`)
      throw new Error(error.message)
    }
  }

  static async updateRefreshToken ({ id, refresh_token }) {
    try {
      const { data: user, error } = await supabase
        .from('usuarios')
        .update({ refresh_token })
        .eq('id', id)
        .select()

      if (error) throw new Error(error.message)

      return user
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async updateUserSecret ({ id, jwt_secret }) {
    try {
      const { data: user, error } = await supabase
        .from('usuarios')
        .update({ jwt_secret })
        .eq('id', id)
        .select()

      if (error) throw new Error(error.message)

      return user
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async updateUser ({ id, input }) {
    const updateData = {}

    if (input.nombre) updateData.nombre = input.nombre
    if (input.apellido) updateData.apellido = input.apellido
    if (input.email) updateData.email = input.email
    if (input.telefono) updateData.telefono = input.telefono
    if (input.direccion) updateData.direccion = input.direccion

    if (input.password) {
      updateData.password = await bcrypt.hash(input.password, 10)
    }

    if (Object.keys(updateData).length === 0) {
      return await this.getById({ id })
    }

    try {
      const { data: user, error } = await supabase.from('usuarios').update(updateData).eq('id', id).select()

      if (error) throw new Error(error.message)

      return user
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async deleteUser ({ id }) {
    try {
      const { error } = await supabase.from('usuarios').update({
        activo: false,
        refresh_token: null // Limpiar refresh token al desactivar usuario
      }).eq('id', id)

      if (error) throw new Error(error.message)

      const deletedUser = await this.getById({ id })
      return deletedUser
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
