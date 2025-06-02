import { petModel } from '../models/petModel.js'
import { vetModel } from '../models/vetModel.js'

/**
 * Ejecuta una serie de validaciones secuencialmente
 * @param {Array} validations - Array de funciones de validación a ejecutar
 * @returns {Object} Resultado de la validación con isValid y message
 */
export async function validate (validations) {
  const initialPromise = Promise.resolve({
    isValid: true,
    message: 'Todas las validaciones pasaron exitosamente'
  })

  return validations.reduce(
    (promiseChain, currentValidation) => {
      return promiseChain.then(async (result) => {
        if (!result.isValid) {
          return result
        }
        return currentValidation()
      })
    },
    initialPromise
  )
}

/**
 * Valida que la mascota exista y pertenezca al cliente especificado
 * @param {number} pet_id - ID de la mascota
 * @param {number} client_id - ID del cliente
 * @returns {Object} Resultado de la validación
 */
export async function validatePet (pet_id, client_id) {
  try {
    const pet = await petModel.getById({ id: pet_id })

    if (!pet || pet.length === 0) {
      return {
        isValid: false,
        message: 'La mascota no existe'
      }
    }

    if (pet[0].cliente_id !== client_id) {
      return {
        isValid: false,
        message: 'La mascota no pertenece al cliente especificado'
      }
    }

    return {
      isValid: true,
      message: 'Validación exitosa'
    }
  } catch (error) {
    return {
      isValid: false,
      message: `Error al validar la mascota: ${error.message}`
    }
  }
}

/**
 * Valida que el veterinario exista y esté activo
 * @param {number} vet_id - ID del veterinario
 * @returns {Object} Resultado de la validación
 */
export async function validateVet (vet_id) {
  try {
    const vet = await vetModel.getById({ id: vet_id })

    if (!vet || vet.length === 0) {
      return {
        isValid: false,
        message: 'El veterinario no existe'
      }
    }

    if (vet[0].activo === false) {
      return {
        isValid: false,
        message: 'El veterinario no está activo'
      }
    }

    return {
      isValid: true,
      message: 'Validación exitosa'
    }
  } catch (error) {
    return {
      isValid: false,
      message: `Error al validar el veterinario: ${error.message}`
    }
  }
}
