import { petModel } from '../models/petModel.js'
import { vetModel } from '../models/vetModel.js'

export async function runValidations (data) {
  const errors = []

  const pet = await validatePet(data.mascota_id, data.cliente_id)
  if (pet.error) errors.push(pet.error)

  const vet = await validateVet(data.profesional_id)
  if (vet.error) errors.push(vet.error)

  const date = validateDate(data.fecha)
  if (date.error) errors.push(date.error)

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
