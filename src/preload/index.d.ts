import type { ElectronAPI } from '@electron-toolkit/preload'

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

export interface PatientAPI {
  create: (data: CreatePatientInput) => Promise<Patient>
  getAll: () => Promise<Patient[]>
  getById: (id: number) => Promise<Patient>
  update: (id: number, data: UpdatePatientInput) => Promise<Patient>
  delete: (id: number) => Promise<void>
}

export type AppointmentStatus = 'confirmed' | 'cancelled'

export interface Appointment {
  id: number
  patientId: number
  patientFirstName: string | null
  patientLastName: string | null
  appointmentDate: Date
  duration: number
  treatment: string
  status: AppointmentStatus
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateAppointmentInput {
  patientId: number
  appointmentDate: Date
  duration?: number
  treatment: string
  status?: AppointmentStatus
  notes?: string | null
}

export interface UpdateAppointmentInput {
  patientId?: number
  appointmentDate?: Date
  duration?: number
  treatment?: string
  status?: AppointmentStatus
  notes?: string | null
}

export interface AppointmentAPI {
  create: (data: CreateAppointmentInput) => Promise<Appointment>
  getAll: () => Promise<Appointment[]>
  getToday: () => Promise<Appointment[]>
  getById: (id: number) => Promise<Appointment>
  update: (id: number, data: UpdateAppointmentInput) => Promise<Appointment>
  delete: (id: number) => Promise<boolean>
}

export interface PaymentRecord {
  id: number
  patientId: number
  patientFirstName?: string
  patientLastName?: string
  amountCents: number
  paymentDate: Date
  createdAt: Date
}

export interface CreatePaymentInput {
  patientId: number
  amountCents: number
}

export interface UpdatePaymentInput {
  amountCents: number
}

export interface PaymentAPI {
  create: (data: CreatePaymentInput) => Promise<PaymentRecord>
  update: (id: number, data: UpdatePaymentInput) => Promise<PaymentRecord>
  getAll: () => Promise<PaymentRecord[]>
  getByPatientId: (patientId: number) => Promise<PaymentRecord[]>
  delete: (id: number) => Promise<boolean>
}

export interface CustomAPI {
  patients: PatientAPI
  appointments: AppointmentAPI
  payments: PaymentAPI
}
declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}
