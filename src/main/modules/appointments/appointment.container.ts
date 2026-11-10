
import { AppointmentRepository } from './repositories/appointment.repository'
import { AppointmentService } from './services/appointment.service'

const appointmentRepository = new AppointmentRepository()

export const appointmentService = new AppointmentService(
  appointmentRepository
)
