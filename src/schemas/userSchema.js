import { z } from 'zod'

const UserSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre no debe exceder los 100 caracteres')
    .trim(),

  email: z.string()
    .email('El correo electrónico no es válido')
    .max(100, 'El correo electrónico no debe exceder los 100 caracteres')
    .trim(),

  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no debe exceder los 100 caracteres')
    .trim(),

  role_id: z.number()
    .min(1, 'El rol es obligatorio')
})

export function validateUser (object) {
  return UserSchema.safeParse(object)
}

export function validatePartialUser (object) {
  return UserSchema.partial().safeParse(object)
}
