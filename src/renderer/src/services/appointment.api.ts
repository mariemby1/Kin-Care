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

export async function getAllAppointments(): Promise<Appointment[]> {
  return window.api.appointments.getAll()
}

export async function getTodayAppointments(): Promise<Appointment[]> {
  return window.api.appointments.getToday()
}

export async function createAppointment(
  data: CreateAppointmentInput
): Promise<Appointment> {
  return window.api.appointments.create(data)
}

export async function updateAppointment(
  id: number,
  data: UpdateAppointmentInput
): Promise<Appointment> {
  return window.api.appointments.update(id, data)
}

export async function deleteAppointment(
  id: number
): Promise<boolean> {
  return window.api.appointments.delete(id)
}

export async function getAppointmentById(
  id: number
): Promise<Appointment> {
  return window.api.appointments.getById(id)
}