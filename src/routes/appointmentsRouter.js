import { Router } from 'express'
import { AppointmentController } from '../controllers/appointmentController.js'

export const appointmentsRouter = Router()

appointmentsRouter.get('/', AppointmentController.getAllAppointments)
appointmentsRouter.get('/:id', AppointmentController.getById)

appointmentsRouter.post('/', AppointmentController.addAppointment)

appointmentsRouter.patch('/:id', AppointmentController.updateAppointment)
appointmentsRouter.delete('/:id', AppointmentController.deleteAppointment)
