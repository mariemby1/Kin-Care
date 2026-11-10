
import { AppointmentRepository } from '../repositories/appointment.repository'

import type {
  CreateAppointmentInput,
  UpdateAppointmentInput
} from '../types/appointment.types'

export class AppointmentService {
  constructor(
    private readonly appointmentRepository: AppointmentRepository
  ) {}

  async createAppointment(data: CreateAppointmentInput) {
    if (!data.treatment.trim()) {
      throw new Error('Treatment is required.')
    }

    if (data.appointmentDate <= new Date()) {
      throw new Error('Appointment date must be in the future.')
    }

    return this.appointmentRepository.create({
      ...data,
      treatment: data.treatment.trim()
    })
  }

  async getAllAppointments() {
    return this.appointmentRepository.findAll()
  }

  async getTodayAppointments() {
    return this.appointmentRepository.findByDate(new Date())
  }

  async getAppointmentById(id: number) {
    this.validateId(id)

    const appointment = await this.appointmentRepository.findById(id)

    if (!appointment) {
      throw new Error('Appointment not found.')
    }

    return appointment
  }

  async updateAppointment(id: number, data: UpdateAppointmentInput) {
    this.validateId(id)

    await this.getAppointmentById(id)

    if (data.appointmentDate && data.appointmentDate <= new Date()) {
      throw new Error('Appointment date must be in the future.')
    }

    if (data.treatment !== undefined && !data.treatment.trim()) {
      throw new Error('Treatment cannot be empty.')
    }

    return this.appointmentRepository.update(id, {
      ...data,
      ...(data.treatment !== undefined
        ? { treatment: data.treatment.trim() }
        : {})
    })
  }

  async deleteAppointment(id: number) {
    this.validateId(id)

    await this.getAppointmentById(id)

    return this.appointmentRepository.delete(id)
  }

  private validateId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid appointment ID.')
    }
  }
  
}
