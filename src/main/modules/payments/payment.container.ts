import { PatientRepository } from '../patients/repositories/patient.repository'
import { PaymentRepository } from './repositories/payment.repository'
import { PaymentService } from './services/payment.service'

export const paymentService = new PaymentService(
  new PaymentRepository(),
  new PatientRepository()
)
