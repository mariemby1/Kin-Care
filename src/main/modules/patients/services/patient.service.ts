import { PatientRepository } from '../repositories/patient.repository'

import type {
  CreatePatientInput,
  PatientWithStatistics,
  UpdatePatientInput
} from '../types/patient.types'

export class PatientService {
  constructor(private readonly patientRepository: PatientRepository) {}

  async createPatient(data: CreatePatientInput): Promise<PatientWithStatistics> {
    const firstName = data.firstName.trim()
    const lastName = data.lastName.trim()
    const phone = data.phone?.trim() ?? ''

    if (!firstName || !lastName) {
      throw new Error('First name and last name are required.')
    }

    return this.patientRepository.create({
      firstName,
      lastName,
      phone,
      notes: data.notes?.trim() || null
    })
  }

  async getAllPatients(): Promise<PatientWithStatistics[]> {
    return this.patientRepository.findAll()
  }

  async getPatientById(id: number): Promise<PatientWithStatistics> {
    this.validateId(id)

    const patient = await this.patientRepository.findById(id)

    if (!patient) {
      throw new Error('Patient not found.')
    }

    return patient
  }

  async updatePatient(
    id: number,
    data: UpdatePatientInput
  ): Promise<PatientWithStatistics> {
    this.validateId(id)

    const patient = await this.patientRepository.findById(id)

    if (!patient) {
      throw new Error('Patient not found.')
    }

    const updatedData: UpdatePatientInput = {}

    if (data.firstName !== undefined) {
      const firstName = data.firstName.trim()

      if (!firstName) {
        throw new Error('First name cannot be empty.')
      }

      updatedData.firstName = firstName
    }

    if (data.lastName !== undefined) {
      const lastName = data.lastName.trim()

      if (!lastName) {
        throw new Error('Last name cannot be empty.')
      }

      updatedData.lastName = lastName
    }

    if (data.phone !== undefined) {
      const phone = data.phone.trim()

      if (!phone) {
        throw new Error('Phone cannot be empty.')
      }

      updatedData.phone = phone
    }

    if (data.notes !== undefined) {
      updatedData.notes = data.notes?.trim() || null
    }

    const updatedPatient = await this.patientRepository.update(id, updatedData)
    if (!updatedPatient) {
      throw new Error('Patient could not be updated.')
    }

    return updatedPatient
  }

  async deletePatient(id: number): Promise<boolean> {
    this.validateId(id)

    const patient = await this.patientRepository.findById(id)

    if (!patient) {
      throw new Error('Patient not found.')
    }

    return this.patientRepository.delete(id)
  }

  private validateId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid patient ID.')
    }
  }
}
