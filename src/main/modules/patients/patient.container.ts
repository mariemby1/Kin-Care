import { PatientRepository } from './repositories/patient.repository'
import { PatientService } from './services/patient.service'

const patientRepository = new PatientRepository()

export const patientService = new PatientService(
  patientRepository
)