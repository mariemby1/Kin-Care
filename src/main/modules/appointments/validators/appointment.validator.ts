
import { z } from 'zod'

const appointmentStatusSchema = z.enum([
  'confirmed',
  'cancelled'
])
export const createAppointmentSchema = z.object({
  patientId: z.number().int().positive(),

  appointmentDate: z.coerce.date(),

  duration: z.number().int().min(5).max(480).default(30),

  treatment: z.string().trim().min(2).max(200),

  status: appointmentStatusSchema.default('confirmed'),

  notes: z.string().trim().max(2000).nullable().optional()
})

export const updateAppointmentSchema = z.object({
  patientId: z.number().int().positive().optional(),

  appointmentDate: z.coerce.date().optional(),

  duration: z.number().int().min(5).max(480).optional(),

  treatment: z.string().trim().min(2).max(200).optional(),

  status: appointmentStatusSchema.optional(),

  notes: z.string().trim().max(2000).nullable().optional()
})

export type CreateAppointmentDTO = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentDTO = z.infer<typeof updateAppointmentSchema>
