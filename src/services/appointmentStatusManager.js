// src/services/appointmentStatusManager.js
import cron from 'node-cron'
import { AppointmentModel } from '#models/appointmentModel.js'
import { getCurrentDateTime } from '#utils/timeUtils.js'
import { NODE_ENV } from '#root/config.js'

export class AppointmentStatusManager {
  static init () {
    if (NODE_ENV === 'development') {
      this.startCron()
    }
  }

  static startCron () {
    cron.schedule('*/15 * * * *', async () => {
      try {
        await Promise.all([
          this.updateInProgressAppointments(),
          this.updateCompletedAppointments()
        ])
      } catch (error) {
        console.error('❌ Error en cron job unificado:', error)
      }
    })
  }

  static async updateInProgressAppointments () {
    try {
      const { currentDate, currentTime } = getCurrentDateTime()

      const allAppointments = await AppointmentModel.getAllAppointments()

      const appointmentsToUpdate = allAppointments.filter(appointment => {
        return (appointment.status === 'Programada' || appointment.status === 'Reprogramada') &&
               appointment.fecha <= currentDate &&
               appointment.hora_inicio <= currentTime &&
               appointment.hora_fin >= currentTime
      })

      if (appointmentsToUpdate.length > 0) {
        const updatePromises = appointmentsToUpdate.map(appointment =>
          AppointmentModel.updateAppointmentStatus({
            id: appointment.id,
            status: 'En Curso'
          }).catch(error => {
            console.error(`❌ Error al actualizar cita ${appointment.id} a "En Curso":`, error)
            return null
          })
        )

        await Promise.all(updatePromises)
      }

      return appointmentsToUpdate.length
    } catch (error) {
      console.error('❌ Error al actualizar citas a "En Curso":', error)
      return 0
    }
  }

  static async updateCompletedAppointments () {
    try {
      const { currentDate, currentTime } = getCurrentDateTime()
      const allAppointments = await AppointmentModel.getAllAppointments()

      const appointmentsToUpdate = allAppointments.filter(appointment => {
        return (appointment.status === 'Programada' ||
                appointment.status === 'Reprogramada' ||
                appointment.status === 'En Curso') &&
               (appointment.fecha < currentDate ||
                (appointment.fecha === currentDate && appointment.hora_fin < currentTime))
      })

      if (appointmentsToUpdate.length > 0) {
        const updatePromises = appointmentsToUpdate.map(appointment =>
          AppointmentModel.updateAppointmentStatus({
            id: appointment.id,
            status: 'Completada'
          }).catch(error => {
            console.error(`❌ Error al actualizar cita ${appointment.id} a "Completada":`, error)
            return null
          })
        )

        await Promise.all(updatePromises)
      }

      return appointmentsToUpdate.length
    } catch (error) {
      console.error('❌ Error al actualizar citas a "Completada":', error)
      return 0
    }
  }
}
