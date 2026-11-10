import { z } from 'zod'

export const createPaymentSchema = z.object({
  patientId: z.number().int().positive(),
  amountCents: z.number().int().positive().max(Number.MAX_SAFE_INTEGER)
})

export const updatePaymentSchema = z.object({
  amountCents: z.number().int().positive().max(Number.MAX_SAFE_INTEGER)
})

export const paymentIdSchema = z.number().int().positive()
export const patientIdSchema = z.number().int().positive()

export type CreatePaymentDTO = z.infer<typeof createPaymentSchema>
