import { supabase } from '#databases/index.js'

/**
 * Asigna automáticamente un profesional disponible para una cita
 * Versión optimizada usando funciones de PostgreSQL
 * @param {Object} appointmentData - Datos de la cita
 * @param {number} appointmentData.servicio_id - ID del servicio (INTEGER)
 * @param {string} appointmentData.fecha - Fecha en formato YYYY-MM-DD
 * @param {string} appointmentData.hora_inicio - Hora en formato HH:MM
 * @returns {Object} - Resultado de la asignación
 */
export async function assignProfessional (appointmentData) {
  const { servicio_id, fecha, hora_inicio } = appointmentData

  try {
    // Ejecutar función principal de PostgreSQL para encontrar el mejor profesional
    const { data: result, error } = await supabase
      .rpc('find_best_professional_for_appointment', {
        p_servicio_id: parseInt(servicio_id), // Asegurar que sea INTEGER
        p_fecha: fecha,
        p_hora_inicio: hora_inicio
      })

    if (error) {
      console.error('Error ejecutando función de PostgreSQL:', error)
      return {
        success: false,
        error: 'Error interno en la asignación de profesional',
        code: 'INTERNAL_ERROR'
      }
    }

    const assignmentResult = result[0]

    if (!assignmentResult.success) {
      // Si no hay disponibilidad, obtener sugerencias
      if (assignmentResult.error_code === 'NO_AVAILABILITY') {
        const suggestions = await getAlternativeTimeSuggestions(servicio_id, fecha)

        return {
          success: false,
          error: assignmentResult.error_message,
          code: assignmentResult.error_code,
          sugerencias: suggestions
        }
      }

      return {
        success: false,
        error: assignmentResult.error_message,
        code: assignmentResult.error_code
      }
    }

    // Éxito: retornar datos del profesional asignado
    return {
      success: true,
      professional: {
        id: assignmentResult.profesional_id,
        nombre: assignmentResult.profesional_nombre,
        apellido: assignmentResult.profesional_apellido
      },
      servicio: {
        nombre: assignmentResult.servicio_nombre,
        duracion_estimada: assignmentResult.duracion_estimada
      },
      hora_fin: assignmentResult.hora_fin
    }
  } catch (error) {
    console.error('Error en asignación automática:', error)
    return {
      success: false,
      error: 'Error interno en la asignación de profesional',
      code: 'INTERNAL_ERROR'
    }
  }
}

/**
 * Obtiene sugerencias de horarios alternativos usando función de PostgreSQL
 * @param {number} servicio_id - ID del servicio (INTEGER)
 * @param {string} fecha - Fecha base para buscar alternativas
 * @param {number} limit - Número máximo de sugerencias (default: 5)
 * @returns {Array} - Array de sugerencias de horarios
 */
export async function getAlternativeTimeSuggestions (servicio_id, fecha, limit = 5) {
  try {
    const { data: suggestions, error } = await supabase
      .rpc('get_alternative_time_suggestions', {
        p_servicio_id: parseInt(servicio_id), // Asegurar que sea INTEGER
        p_fecha_inicial: fecha,
        p_limit: limit
      })

    if (error) {
      console.error('Error obteniendo sugerencias:', error)
      return []
    }

    // Formatear sugerencias para el formato esperado por el frontend
    return suggestions.map(suggestion => ({
      fecha: suggestion.fecha,
      hora: suggestion.hora_inicio,
      profesional: `${suggestion.profesional_nombre} ${suggestion.profesional_apellido}`,
      profesional_id: suggestion.profesional_id
    }))
  } catch (error) {
    console.error('Error generando sugerencias:', error)
    return []
  }
}

/**
 * Obtiene todos los profesionales disponibles para un servicio específico
 * Útil para mostrar opciones al usuario o para debugging
 * @param {number} servicio_id - ID del servicio (INTEGER)
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {string} hora_inicio - Hora en formato HH:MM
 * @param {string} hora_fin - Hora en formato HH:MM
 * @returns {Array} - Array de profesionales disponibles
 */
export async function getAvailableProfessionals (servicio_id, fecha, hora_inicio, hora_fin) {
  try {
    const { data: professionals, error } = await supabase
      .rpc('get_available_professionals', {
        p_servicio_id: parseInt(servicio_id), // Asegurar que sea INTEGER
        p_fecha: fecha,
        p_hora_inicio: hora_inicio,
        p_hora_fin: hora_fin
      })

    if (error) {
      console.error('Error obteniendo profesionales disponibles:', error)
      return []
    }

    return professionals.map(prof => ({
      id: prof.profesional_id,
      nombre: prof.nombre,
      apellido: prof.apellido,
      especialidad: prof.especialidad,
      appointmentCount: prof.appointment_count
    }))
  } catch (error) {
    console.error('Error en getAvailableProfessionals:', error)
    return []
  }
}

/**
 * Función de utilidad para calcular hora de fin
 * Mantiene compatibilidad con el código existente
 * @param {string} hora_inicio - Hora de inicio en formato HH:MM
 * @param {number} duracion_minutos - Duración en minutos
 * @returns {string} - Hora de fin en formato HH:MM
 */
export function calcularHoraFin (hora_inicio, duracion_minutos) {
  const [hours, minutes] = hora_inicio.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + duracion_minutos

  const endHours = Math.floor(totalMinutes / 60)
  const endMinutes = totalMinutes % 60

  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
}
