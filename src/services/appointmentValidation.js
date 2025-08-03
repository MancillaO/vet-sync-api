import { petModel } from '#models/petModel.js'
import { vetModel } from '#models/vetModel.js'
import { AppointmentModel } from '#models/appointmentModel.js'
import { scheduleModel } from '#models/scheduleModel.js'
import { serviceModel } from '#models/serviceModel.js'
import { checkIfTimeIsWithinRange, isValidTimeFormat, calcularHoraFin } from '#utils/timeUtils.js'

export async function runValidations (data) {
  // Acumula errores para devolver todas las validaciones fallidas juntas
  const errors = []

  // 1. Valida que la mascota exista y pertenezca al cliente indicado
  const pet = await validatePet(data.mascota_id, data.cliente_id)
  if (pet.error) errors.push(pet.error)

  // 2. Valida que la fecha no sea en el pasado
  const date = validateDate(data.fecha)
  if (date.error) errors.push(date.error)

  // 3. Valida disponibilidad de horario y superposiciones (solo si se proporciona profesional_id)
  if (data.profesional_id) {
    const vet = await validateVet(data.profesional_id)
    if (vet.error) errors.push(vet.error)

    const appointmentTime = await validateAppointmentTime(data)
    if (appointmentTime.error) errors.push(appointmentTime.error)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

async function validatePet (petId, clientId) {
  try {
    const pet = await petModel.getById({ id: petId })

    if (!pet || pet.length === 0) {
      return { error: 'La mascota no existe' }
    }

    if (pet[0].cliente_id !== clientId) {
      return { error: 'La mascota no pertenece al cliente' }
    }

    return { error: null }
  } catch (error) {
    return { error: 'Error al validar la mascota' }
  }
}

async function validateVet (vetId) {
  try {
    const vet = await vetModel.getById({ id: vetId })

    if (!vet || vet.length === 0) {
      return { error: 'El veterinario no existe' }
    }

    if (!vet[0].activo) {
      return { error: 'El veterinario no está activo' }
    }

    return { error: null }
  } catch (error) {
    return { error: 'Error al validar el veterinario' }
  }
}

function validateDate (dateString) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const appointmentDate = new Date(dateString)
    appointmentDate.setHours(0, 0, 0, 0)

    if (appointmentDate < today) {
      return { error: 'La fecha no puede ser pasada' }
    }

    return { error: null }
  } catch (error) {
    return { error: 'Fecha inválida' }
  }
}

async function validateAppointmentTime (appointmentData) {
  try {
    const { profesional_id, cliente_id, fecha, hora_inicio, servicio_id } = appointmentData

    // Verificaciones básicas de los datos de hora
    if (!hora_inicio) {
      return { error: 'Se requiere especificar la hora de inicio de la cita' }
    }

    if (!isValidTimeFormat(hora_inicio)) {
      return { error: 'El formato de hora debe ser HH:MM' }
    }

    if (!servicio_id) {
      return { error: 'Se requiere especificar el servicio para la cita' }
    }

    // Si no hay profesional_id, solo validamos formato básico
    // La asignación automática se encarga del resto
    if (!profesional_id) {
      return { error: null }
    }

    // Obtener la duración del servicio usando serviceModel
    const servicio = await serviceModel.getById({ id: servicio_id })

    if (!servicio || servicio.length === 0) {
      return { error: 'No se pudo obtener la información del servicio' }
    }

    // Calcular hora_fin basada en la duración del servicio (simular el trigger de BD)
    const duracionMinutos = servicio[0].duracion_minutos || 30 // Fallback a 30 minutos si no hay duración
    const hora_fin = calcularHoraFin(hora_inicio, duracionMinutos)

    const dayOfWeek = new Date(fecha).getDay()
    const dayMap = {
      0: 'D', // Domingo
      1: 'L', // Lunes
      2: 'M', // Martes
      3: 'W', // Miércoles
      4: 'J', // Jueves
      5: 'V', // Viernes
      6: 'S' // Sábado
    }
    const dayLetter = dayMap[dayOfWeek]

    const schedules = await scheduleModel.getScheduleForDay({
      profesionalId: profesional_id,
      dayPattern: `%${dayLetter}%`
    })

    if (!schedules || schedules.length === 0) {
      return { error: 'El profesional no tiene horario asignado para este día' }
    }

    const profesionalSchedule = schedules[0]

    // 1. Verificar que la cita completa esté dentro del horario laboral del profesional
    // Esto implica comprobar que tanto el inicio como el fin de la cita estén dentro del horario laboral
    const startIsWithinHours = checkIfTimeIsWithinRange(
      hora_inicio,
      profesionalSchedule.hora_inicio,
      profesionalSchedule.hora_fin
    )

    const endIsWithinHours = checkIfTimeIsWithinRange(
      hora_fin,
      profesionalSchedule.hora_inicio,
      profesionalSchedule.hora_fin
    )

    if (!startIsWithinHours || !endIsWithinHours) {
      return {
        error: `La cita debe estar completamente dentro del horario del profesional: ${profesionalSchedule.hora_inicio} - ${profesionalSchedule.hora_fin}`
      }
    }

    // 2. Verificar si hay citas superpuestas para el mismo profesional
    // Usamos hora_fin calculada con la duración del servicio
    const overlappingProfessionalAppointments = await AppointmentModel.findOverlappingAppointments({
      profesional_id,
      fecha,
      hora_inicio,
      hora_fin // Este valor es calculado, no proviene de la petición
    })

    if (overlappingProfessionalAppointments.length > 0) {
      return {
        error: 'El profesional ya tiene una cita agendada en ese horario'
      }
    }

    // 3. Verificar si hay citas superpuestas para el mismo cliente
    // Usamos hora_fin calculada con la duración del servicio
    const overlappingClientAppointments = await AppointmentModel.findOverlappingAppointments({
      cliente_id,
      fecha,
      hora_inicio,
      hora_fin // Este valor es calculado, no proviene de la petición
    })

    if (overlappingClientAppointments.length > 0) {
      return {
        error: 'El cliente ya tiene una cita agendada en ese horario'
      }
    }

    return { error: null }
  } catch (error) {
    console.error('Error al validar horario de cita:', error)
    return { error: 'Error al validar el horario de la cita' }
  }
}

// Las funciones checkIfTimeIsWithinRange, isValidTimeFormat y calcularHoraFin
// han sido movidas a src/utils/timeUtils.js
