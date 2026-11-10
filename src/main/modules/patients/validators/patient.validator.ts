import { z } from 'zod'

export const createPatientSchema = z.object({
  firstName: z.string().trim().min(2, 'Le prénom doit contenir au moins 2 caractères').max(100),

  lastName: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),

  phone: z
    .string()
    .trim()
    .max(20, 'Numéro de téléphone trop long')
    .refine((phone) => phone.length === 0 || phone.length >= 8, 'Numéro de téléphone invalide')
    .optional()
    .default(''),

  notes: z.string().trim().max(2000).optional().nullable()
})

export const updatePatientSchema = createPatientSchema.partial()

export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
