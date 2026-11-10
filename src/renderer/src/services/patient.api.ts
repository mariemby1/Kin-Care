import type { PaymentRecord } from './payment.api'

/**
 * Patient API
 *
 * Frontend service responsible for communicating
 * with the Electron backend through the Preload API.
 */

export interface Patient {
  id: number
  firstName: string
  lastName: string
  phone: string
  notes: string | null
  completedSessions: number
  totalPaidCents: number
  payments: PaymentRecord[]
  createdAt: Date
  updatedAt: Date
}

export interface CreatePatientInput {
  firstName: string
  lastName: string
  phone?: string
  notes?: string | null
}

export interface UpdatePatientInput {
  firstName?: string
  lastName?: string
  phone?: string
  notes?: string | null
}

/**
 * Create a new patient
 */
export async function createPatient(data: CreatePatientInput): Promise<Patient> {
  return window.api.patients.create(data)
}

/**
 * Get all patients
 */
export async function getAllPatients(): Promise<Patient[]> {
  return window.api.patients.getAll()
}

/**
 * Get patient by ID
 */
export async function getPatientById(id: number): Promise<Patient> {
  return window.api.patients.getById(id)
}

/**
 * Update an existing patient
 */
export async function updatePatient(id: number, data: UpdatePatientInput): Promise<Patient> {
  return window.api.patients.update(id, data)
}

/**
 * Delete a patient
 */
export async function deletePatient(id: number): Promise<void> {
  return window.api.patients.delete(id)
}
