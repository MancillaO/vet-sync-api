import { supabase } from './connection.js'

export class serviceModel {
  static async getAllServices ({ categoria_id }) {
    let query = supabase.from('servicios').select()

    if (categoria_id) {
      query = query.eq('categoria_id', categoria_id)
    }

    try {
      const { data: services, error } = await query

      if (error) throw error

      return services
    } catch (error) {
      throw error
    }
  }

  static async getById ({ id }) {
    try {
      const { data: service, error } = await supabase.from('servicios').select().eq('id', id)

      if (error) throw error

      return service
    } catch (error) {
      throw error
    }
  }

  static async getActiveServices ({ active }) {
    try {
      const { data: services, error } = await supabase.from('servicios').select().eq('activo', active)

      if (error) throw error

      return services
    } catch (error) {
      throw error
    }
  }

  static async addService ({ input }) {
    try {
      const { data: service, error } = await supabase.from('servicios').insert([input]).select()

      if (error) throw error

      return service
    } catch (error) {
      throw error
    }
  }

  static async updateService ({ id, input }) {
    const updateData = {}

    if (input.nombre) updateData.nombre = input.nombre
    if (input.descripcion) updateData.descripcion = input.descripcion
    if (input.precio) updateData.precio = input.precio
    if (input.duracion_estimada) updateData.duracion_estimada = input.duracion_estimada
    if (input.categoria_id) updateData.categoria_id = input.categoria_id

    if (Object.keys(updateData).length === 0) {
      return await this.getById({ id })
    }

    try {
      const { data: service, error } = await supabase.from('servicios').update(updateData).eq('id', id).select()

      if (error) throw error

      return service
    } catch (error) {
      throw error
    }
  }

  static async deleteService ({ id }) {
    try {
      const { data: service, error } = await supabase.from('servicios')
        .update({ activo: false }).eq('id', id).select()

      if (error) throw error

      return service
    } catch (error) {
      throw error
    }
  }
}
