import { desc, eq } from 'drizzle-orm'

import { db } from '../../../database/database-connection'
import { patients } from '../../../database/schema/patients.schema'
import { payments } from '../../../database/schema/payments.schema'

import type {
  CreatePaymentInput,
  PaymentRecord,
  UpdatePaymentInput
} from '../types/payment.types'

export class PaymentRepository {
  async create(data: CreatePaymentInput): Promise<PaymentRecord> {
    const result = await db
      .insert(payments)
      .values({
        ...data,
        paymentDate: new Date(),
        createdAt: new Date()
      })
      .returning()

    const payment = result[0]
    if (!payment) {
      throw new Error('Failed to create payment.')
    }

    return payment
  }

  async update(id: number, data: UpdatePaymentInput): Promise<PaymentRecord | null> {
    const result = await db
      .update(payments)
      .set(data)
      .where(eq(payments.id, id))
      .returning()

    return result[0] ?? null
  }

  async findAll(): Promise<PaymentRecord[]> {
    return db
      .select({
        id: payments.id,
        patientId: payments.patientId,
        patientFirstName: patients.firstName,
        patientLastName: patients.lastName,
        amountCents: payments.amountCents,
        paymentDate: payments.paymentDate,
        createdAt: payments.createdAt
      })
      .from(payments)
      .innerJoin(patients, eq(payments.patientId, patients.id))
      .orderBy(desc(payments.paymentDate))
  }

  async findByPatientId(patientId: number): Promise<PaymentRecord[]> {
    return db
      .select()
      .from(payments)
      .where(eq(payments.patientId, patientId))
      .orderBy(desc(payments.paymentDate))
  }

  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(payments)
      .where(eq(payments.id, id))
      .returning({ id: payments.id })

    return result.length > 0
  }
}
