import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseKey } from '../../config.js'
import bcrypt from 'bcrypt'

const supabase = createClient(supabaseUrl, supabaseKey)

export class userModel {

  static async createUser ({ input }){
    const { name, email, password, role_id } = input
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
      const { data, error } = await supabase.from('users').insert({
        name,
        email,
        role_id,
        password: hashedPassword
      }).select()

      if (error) throw error

      return data
    } catch (error) {
      throw error
    }
  }

  static async getAllUsers ({ email }) {
    let query = supabase.from('users').select()

    if (email) {
      query = query.eq('email', email)
    }

    const { data, error } = await query

    if (error) throw error

    return data
  }

  static async getById ({ id }){
    const { data, error } = await supabase.from('users').select().eq('id', id)
    if (error) throw error

    return data

  }

  static async updateUser ({ id, input }) {
    const updateData = {}

    if (input.name !== undefined) updateData.name = input.name
    if (input.email !== undefined) updateData.email = input.email
    if (input.role_id !== undefined) updateData.role_id = input.role_id

    if (input.password !== undefined) {
      updateData.password = await bcrypt.hash(input.password, 10)
    }

    if (Object.keys(updateData).length === 0) {
      return await this.getById({ id })
    }

    try {
      const { data, error } = await supabase.from('users').update(updateData).eq('id', id).select()

      if (error) throw error

      return data
    } catch (error) {
      throw error
    }
  }

  static async deleteUser ({ id }) {
    try {
      const { error } = await supabase.from('users').update({ is_active: false }).eq('id', id)

      if (error) throw error

      const deletedUser = await this.getById({ id })
      return deletedUser
    } catch (error) {
      throw error
    }
  }
}
