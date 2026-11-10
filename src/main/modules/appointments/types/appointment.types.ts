
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

export interface AppointmentWithPatient extends Appointment {
  patientFirstName: string | null
  patientLastName: string | null
}
