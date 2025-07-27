import { validateAppointment, validatePartialAppointment } from '#schemas/appointmentSchema.js'
import { AppointmentModel } from '#models/appointmentModel.js'
import { runValidations } from '#services/appointmentValidation.js'

export class AppointmentController {
  static async getAllAppointments (req, res) {
    try {
      const appointments = await AppointmentModel.getAllAppointments()

      if (appointments.length === 0) {
        return res.status(200).json({ message: 'No appointments found', data: [] })
      }

      return res.json({ message: 'Appointments found', data: appointments })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async getById (req, res) {
    const { id } = req.params

    try {
      const appointment = await AppointmentModel.getById({ id })

      if (appointment.length === 0) {
        return res.status(404).json({ error: 'Appointment not found' })
      }

      return res.json({ message: 'Appointment found', data: appointment })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async getDetailedAppointments (req, res) {
    try {
      const appointments = await AppointmentModel.getDetailedAppointments()

      if (appointments.length === 0) {
        return res.status(200).json({ message: 'No detailed appointments found', data: [] })
      }

      return res.json({ message: 'Appointments found', data: appointments })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async getDetailedAppointment (req, res) {
    const { id } = req.params

    try {
      const appointment = await AppointmentModel.getDetailedAppointment({ id })

      if (appointment.length === 0) {
        return res.status(404).json({ error: 'Appointment not found' })
      }

      return res.json({ message: 'Appointment found', data: appointment })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async addAppointment (req, res) {
    const result = validateAppointment(req.body)

    if (result.error) {
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    try {
      const validation = await runValidations(result.data)

      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Error de validación',
          details: validation.errors
        })
      }

      const appointment = await AppointmentModel.addAppointment({ input: result.data })
      return res.status(201).json({
        message: 'Cita creada exitosamente',
        data: appointment
      })
    } catch (error) {
      console.error('Error inesperado:', error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  static async updateAppointment (req, res) {
    const { id } = req.params
    const result = validatePartialAppointment(req.body)

    if (result.error) {
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    try {
      const appointment = await AppointmentModel.updateAppointment({ id, input: result.data })
      return res.status(200).json({ message: 'Appointment updated', data: appointment })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async deleteAppointment (req, res) {
    const { id } = req.params

    try {
      const appointment = await AppointmentModel.deleteAppointment({ id })

      if (appointment.length === 0) {
        return res.status(404).json({ error: 'Appointment not found' })
      }

      return res.json({ message: 'Appointment deleted', data: appointment })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }
}
