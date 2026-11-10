
import { eq, desc, and, gte, lt } from 'drizzle-orm'

import { db } from '../../../database/database-connection'
import { appointments } from '../../../database/schema/appointments.schema'
import { patients } from '../../../database/schema/patients.schema'

import type {
  AppointmentWithPatient,
  CreateAppointmentInput,
  UpdateAppointmentInput
} from '../types/appointment.types'

export class AppointmentRepository {
  async create(data: CreateAppointmentInput) {
    const now = new Date()

    const result = await db
      .insert(appointments)
      .values({
        ...data,
        duration: data.duration ?? 30,
        status: data.status ?? 'confirmed',
        notes: data.notes ?? null,
        createdAt: now,
        updatedAt: now
      })
      .returning()

    const appointment = result[0]
    if (!appointment) {
      throw new Error('Failed to create appointment.')
    }

    return appointment
  }

  async findAll(): Promise<AppointmentWithPatient[]> {
    const results = await db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        patientFirstName: patients.firstName,
        patientLastName: patients.lastName,
        appointmentDate: appointments.appointmentDate,
        duration: appointments.duration,
        treatment: appointments.treatment,
        status: appointments.status,
        notes: appointments.notes,
        createdAt: appointments.createdAt,
        updatedAt: appointments.updatedAt
      })
      .from(appointments)
      .leftJoin(
        patients,
        eq(appointments.patientId, patients.id)
      )
      .orderBy(desc(appointments.appointmentDate))

    return results
  }

  async findById(id: number): Promise<AppointmentWithPatient | null> {
    const result = await db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        patientFirstName: patients.firstName,
        patientLastName: patients.lastName,
        appointmentDate: appointments.appointmentDate,
        duration: appointments.duration,
        treatment: appointments.treatment,
        status: appointments.status,
        notes: appointments.notes,
        createdAt: appointments.createdAt,
        updatedAt: appointments.updatedAt
      })
      .from(appointments)
      .leftJoin(
        patients,
        eq(appointments.patientId, patients.id)
      )
      .where(eq(appointments.id, id))
      .limit(1)

    return result[0] ?? null
  }

  async findByDate(date: Date): Promise<AppointmentWithPatient[]> {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)

    const end = new Date(start)
    end.setDate(end.getDate() + 1)

    const results = await db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        patientFirstName: patients.firstName,
        patientLastName: patients.lastName,
        appointmentDate: appointments.appointmentDate,
        duration: appointments.duration,
        treatment: appointments.treatment,
        status: appointments.status,
        notes: appointments.notes,
        createdAt: appointments.createdAt,
        updatedAt: appointments.updatedAt
      })
      .from(appointments)
      .leftJoin(
        patients,
        eq(appointments.patientId, patients.id)
      )
      .where(
        and(
          gte(appointments.appointmentDate, start),
          lt(appointments.appointmentDate, end)
        )
      )
      .orderBy(appointments.appointmentDate)

    return results
  }

  async update(id: number, data: UpdateAppointmentInput) {
    const result = await db
      .update(appointments)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(appointments.id, id))
      .returning()

    return result[0] ?? null
  }

  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(appointments)
      .where(eq(appointments.id, id))
      .returning({ id: appointments.id })

    return result.length > 0
  }
}
