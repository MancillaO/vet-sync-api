import { supabase } from './connection.js'
import bcrypt from 'bcrypt'

export class userModel {

  static async createUser ({ input }){
    const { nombre, apellido, email, password, telefono, direccion } = input
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
      const { data, error } = await supabase.from('usuarios').insert({
        nombre,
        apellido,
        email,
        telefono,
        direccion: direccion || '',
        password: hashedPassword
      }).select()

      if (error) throw new Error(error.message)

      return data
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async getAllUsers ({ email }) {
    let query = supabase.from('usuarios').select()

    if (email) {
      query = query.eq('email', email)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)

    return data
  }

  static async getById ({ id }){
    const { data, error } = await supabase.from('usuarios').select().eq('id', id)
    if (error) throw new Error(error.message)

    return data

  }

  static async updateUser ({ id, input }) {
    const updateData = {}

    input.nombre ? updateData.nombre = input.nombre : null
    input.apellido ? updateData.apellido = input.apellido : null
    input.email ? updateData.email = input.email : null
    input.telefono ? updateData.telefono = input.telefono : null
    input.direccion ? updateData.direccion = input.direccion : null

    if (input.password) {
      updateData.password = await bcrypt.hash(input.password, 10)
    }

    if (Object.keys(updateData).length === 0) {
      return await this.getById({ id })
    }

    try {
      const { data, error } = await supabase.from('usuarios').update(updateData).eq('id', id).select()

      if (error) throw new Error(error.message)

      return data
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async deleteUser ({ id }) {
    try {
      const { error } = await supabase.from('usuarios').update({ activo: false }).eq('id', id)

      if (error) throw new Error(error.message)

      const deletedUser = await this.getById({ id })
      return deletedUser
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
