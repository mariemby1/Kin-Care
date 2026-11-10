import type { PaymentRecord } from '../../payments/types/payment.types'

export interface PatientWithStatistics {
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

export interface Patient {
  id: number
  firstName: string
  lastName: string
  phone: string
  notes: string | null
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
