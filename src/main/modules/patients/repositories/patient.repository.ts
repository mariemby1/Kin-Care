import { eq, desc, sql } from 'drizzle-orm'
import { db } from '../../../database/database-connection'
import { appointments } from '../../../database/schema/appointments.schema'
import { patients } from '../../../database/schema/patients.schema'
import { payments } from '../../../database/schema/payments.schema'
import type {
  CreatePatientInput,
  PatientWithStatistics,
  UpdatePatientInput
} from '../types/patient.types'

export class PatientRepository {
  async create(data: CreatePatientInput): Promise<PatientWithStatistics> {
    const now = new Date()

    const result = await db
      .insert(patients)
      .values({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone ?? '',
        notes: data.notes ?? null,
        createdAt: now,
        updatedAt: now
      })
      .returning()

    const patient = result[0]
    if (!patient) {
      throw new Error('Failed to create patient.')
    }

    return {
      ...patient,
      completedSessions: 0,
      totalPaidCents: 0,
      payments: []
    }
  }

  async findAll(): Promise<PatientWithStatistics[]> {
    const now = Date.now()

    const patientRows = await db
      .select({
        id: patients.id,
        firstName: patients.firstName,
        lastName: patients.lastName,
        phone: patients.phone,
        notes: patients.notes,
        createdAt: patients.createdAt,
        updatedAt: patients.updatedAt,
        completedSessions: sql<number>`(select count(*) from ${appointments}
          where ${appointments.patientId} = ${patients.id}
            and ${appointments.status} = 'confirmed'
            and ${appointments.appointmentDate} < ${now})`
      })
      .from(patients)
      .orderBy(desc(patients.createdAt))

    const paymentRows = await db.select().from(payments).orderBy(desc(payments.paymentDate))
    const paymentsByPatient = new Map<number, typeof paymentRows>()

    for (const payment of paymentRows) {
      const patientPayments = paymentsByPatient.get(payment.patientId) ?? []
      patientPayments.push(payment)
      paymentsByPatient.set(payment.patientId, patientPayments)
    }

    return patientRows.map((patient) => ({
      ...patient,
      payments: paymentsByPatient.get(patient.id) ?? [],
      totalPaidCents: (paymentsByPatient.get(patient.id) ?? []).reduce(
        (total, payment) => total + payment.amountCents,
        0
      )
    }))
  }

  async findById(id: number): Promise<PatientWithStatistics | null> {
    const now = Date.now()
    const result = await db
      .select({
        id: patients.id,
        firstName: patients.firstName,
        lastName: patients.lastName,
        phone: patients.phone,
        notes: patients.notes,
        createdAt: patients.createdAt,
        updatedAt: patients.updatedAt,
        completedSessions: sql<number>`(select count(*) from ${appointments}
          where ${appointments.patientId} = ${patients.id}
            and ${appointments.status} = 'confirmed'
            and ${appointments.appointmentDate} < ${now})`
      })
      .from(patients)
      .where(eq(patients.id, id))
      .limit(1)

    const patient = result[0]
    if (!patient) {
      return null
    }

    const patientPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.patientId, id))
      .orderBy(desc(payments.paymentDate))

    return {
      ...patient,
      payments: patientPayments,
      totalPaidCents: patientPayments.reduce((total, payment) => total + payment.amountCents, 0)
    }
  }

  async update(
    id: number,
    data: UpdatePatientInput
  ): Promise<PatientWithStatistics | null> {
    const result = await db
      .update(patients)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(patients.id, id))
      .returning()

    if (!result[0]) {
      return null
    }

    return this.findById(id)
  }

  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(patients)
      .where(eq(patients.id, id))
      .returning({ id: patients.id })

    return result.length > 0
  }
}
