
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
  phone: string
  notes?: string | null
}

export interface UpdatePatientInput {
  firstName?: string
  lastName?: string
  phone?: string
  notes?: string | null
}
