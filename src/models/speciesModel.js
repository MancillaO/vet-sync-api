import { supabase } from './connection.js'

export class speciesModel{
  static async getAllSpecies (){
    const { data, error } = await supabase.from('especies').select()

    if (error) throw new Error(error.message)

    return data
  }

  static async getById ({ id }) {
    const { data, error } = await supabase.from('especies').select().eq('id', id)
    if (error) throw new Error(error.message)

    return data
  }

  static async getByName ({ name }) {
    const { data, error } = await supabase.from('especies').select().eq('nombre', name)
    if (error) throw new Error(error.message)

    return data
  }
}
