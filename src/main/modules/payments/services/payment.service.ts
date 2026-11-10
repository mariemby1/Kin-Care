import { PatientRepository } from '../../patients/repositories/patient.repository'
import { PaymentRepository } from '../repositories/payment.repository'

import type {
  CreatePaymentInput,
  PaymentRecord,
  UpdatePaymentInput
} from '../types/payment.types'

export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly patientRepository: PatientRepository
  ) {}

  async createPayment(data: CreatePaymentInput): Promise<PaymentRecord> {
    if (!Number.isInteger(data.patientId) || data.patientId <= 0) {
      throw new Error('Invalid patient ID.')
    }

    const patient = await this.patientRepository.findById(data.patientId)
    if (!patient) {
      throw new Error('Patient not found.')
    }

    if (!Number.isInteger(data.amountCents) || data.amountCents <= 0) {
      throw new Error('Payment amount must be greater than zero.')
    }

    return this.paymentRepository.create(data)
  }

  async updatePayment(id: number, data: UpdatePaymentInput): Promise<PaymentRecord> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid payment ID.')
    }

    if (!Number.isInteger(data.amountCents) || data.amountCents <= 0) {
      throw new Error('Payment amount must be greater than zero.')
    }

    const payment = await this.paymentRepository.update(id, data)
    if (!payment) {
      throw new Error('Payment not found.')
    }

    return payment
  }

  async getAllPayments(): Promise<PaymentRecord[]> {
    return this.paymentRepository.findAll()
  }

  async getPatientPayments(patientId: number): Promise<PaymentRecord[]> {
    if (!Number.isInteger(patientId) || patientId <= 0) {
      throw new Error('Invalid patient ID.')
    }

    const patient = await this.patientRepository.findById(patientId)
    if (!patient) {
      throw new Error('Patient not found.')
    }

    return this.paymentRepository.findByPatientId(patientId)
  }

  async deletePayment(id: number): Promise<boolean> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid payment ID.')
    }

    const deleted = await this.paymentRepository.delete(id)
    if (!deleted) {
      throw new Error('Payment not found.')
    }

    return true
  }
}
