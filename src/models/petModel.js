import { supabase } from './connection.js'

export class petModel {
  static async addPet ({ input }){
    const { nombre, cliente_id, especie_id, raza_id, edad, sexo } = input

    try {
      const { data, error } = await supabase.from('mascotas').insert({
        nombre,
        cliente_id,
        especie_id,
        raza_id,
        edad,
        sexo
      }).select()

      if (error) throw new Error(error.message)

      return data
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async getAllPets (){
    try {
      const { data, error } = await supabase.from('mascotas').select()

      if (error) throw new Error(error.message)

      return data
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async getDetailedPet ({ clienteId }) {
    try {
      const { data, error } = await supabase.rpc('obtener_mascotas', { p_cliente_id: clienteId ?? null })

      if (error) throw new Error(error.message)

      return data
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async getById ({ id }) {
    try {
      const { data, error } = await supabase.from('mascotas').select().eq('id', id)

      if (error) throw new Error(error.message)

      return data
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async updatePet ({ id, input }) {
    const updateData = {}

    input.nombre ? updateData.nombre = input.nombre : null
    input.cliente_id ? updateData.cliente_id = input.cliente_id : null
    input.especie_id ? updateData.especie_id = input.especie_id : null
    input.raza_id ? updateData.raza_id = input.raza_id : null
    input.edad ? updateData.edad = input.edad : null
    input.sexo ? updateData.sexo = input.sexo : null

    if (Object.keys(updateData).length === 0) {
      return await this.getById({ id })
    }

    try {
      const { data, error } = await supabase.from('mascotas').update(updateData).eq('id', id).select()

      if (error) throw new Error(error.message)

      return data
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async deletePet ({ id }) {
    try {
      const { error } = await supabase.from('mascotas').update({ activo: false }).eq('id', id)

      if (error) throw new Error(error.message)

      const deletedPet = await this.getById({ id })
      return deletedPet
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
