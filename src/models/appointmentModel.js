import { supabase } from './connection.js'

export class AppointmentModel {
  static async getAllAppointments () {
    try {
      const { data: appointments, error } = await supabase.from('citas').select()

      if (error) throw error

      return appointments
    } catch (error) {
      throw error
    }
  }

  static async getById ({ id }) {
    try {
      const { data: appointment, error } = await supabase.from('citas').select().eq('id', id)

      if (error) throw error

      return appointment
    } catch (error) {
      throw error
    }
  }

  static async getDetailedAppointments () {
    try {
      const { data: appointments, error } = await supabase.rpc('obtener_citas_detalle')

      if (error) throw error

      return appointments
    } catch (error) {
      throw error
    }
  }

  static async getDetailedAppointment ({ id }) {
    try {
      const { data: appointment, error } = await supabase.rpc(
        'obtener_citas_detalle',
        { p_cita_id: id ?? null }
      )

      if (error) throw error

      return appointment
    } catch (error) {
      throw error
    }
  }

  static async addAppointment ({ input }) {
    try {
      const { data: appointment, error } = await supabase.from('citas').insert([input]).select()

      if (error) throw error

      return appointment
    } catch (error) {
      throw error
    }
  }

  static async updateAppointment ({ id, input }) {
    const updateData = {}

    if (input.cliente_id) updateData.cliente_id = input.cliente_id
    if (input.mascota_id) updateData.mascota_id = input.mascota_id
    if (input.profesional_id) updateData.profesional_id = input.profesional_id
    if (input.servicio_id) updateData.servicio_id = input.servicio_id
    if (input.fecha) updateData.fecha_cita = input.fecha
    if (input.hora_inicio) updateData.hora_cita = input.hora_cita
    if (input.motivo_consulta) updateData.motivo_consulta = input.motivo_consulta

    if (Object.keys(updateData).length === 0) {
      return await this.getById({ id })
    }

    try {
      const { data: appointment, error } = await supabase.from('citas').update(updateData).eq('id', id).select()

      if (error) throw error

      return appointment
    } catch (error) {
      throw error
    }
  }

  static async deleteAppointment ({ id }) {
    try {
      const { data: appointment, error } = await supabase.from('citas').delete().eq('id', id).select()

      if (error) throw error

      return appointment
    } catch (error) {
      throw error
    }
  }
}
