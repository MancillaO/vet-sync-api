import { supabase } from './connection.js'

export class vetModel{
  static async addVet ({ input }){
    const { nombre, apellido, email, telefono, especialidad } = input

    try {
      const { data: vet, error } = await supabase.from('profesionales').insert({
        nombre,
        apellido,
        email,
        telefono,
        especialidad
      }).select()

      if (error) throw new Error(error.message)

      return vet
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async getAllVets (){
    const { data: vets, error } = await supabase.from('profesionales').select()

    if (error) throw new Error(error.message)

    return vets
  }

  static async getById ({ id }){
    const { data: vet, error } = await supabase.from('profesionales').select().eq('id', id)

    if (error) throw new Error(error.message)

    return vet
  }

  static async updateVet ({ id, input }){
    const updateData = {}

    input.nombre ? updateData.nombre = input.nombre : null
    input.apellido ? updateData.apellido = input.apellido : null
    input.email ? updateData.email = input.email : null
    input.telefono ? updateData.telefono = input.telefono : null
    input.especialidad ? updateData.especialidad = input.especialidad : null

    if (Object.keys(updateData).length === 0) {
      return await this.getById({ id })
    }

    try {
      const { data: vet, error } = await supabase.from('profesionales').update(updateData).eq('id', id).select()

      if (error) throw new Error(error.message)

      return vet
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async deleteVet ({ id }){
    try {
      const { error } = await supabase.from('profesionales').update({ activo: false }).eq('id', id)

      if (error) throw new Error(error.message)

      const deletedVet = await this.getById({ id })
      return deletedVet
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
