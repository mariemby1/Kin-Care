import { useCallback, useEffect, useState } from 'react'

import {
  createPatient,
  getAllPatients,
  updatePatient,
  deletePatient,
  type Patient,
  type CreatePatientInput,
  type UpdatePatientInput
} from '../../../services/patient.api'

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // LOAD PATIENTS
  const refreshPatients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getAllPatients()
      setPatients(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de charger les patients.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  // CREATE PATIENT
  const addPatient = async (
    data: CreatePatientInput
  ): Promise<void> => {
    await createPatient(data)
    await refreshPatients()
  }

  // UPDATE PATIENT
  const editPatient = async (
    id: number,
    data: UpdatePatientInput
  ): Promise<void> => {
    await updatePatient(id, data)
    await refreshPatients()
  }

  // DELETE PATIENT
  const removePatient = async (id: number): Promise<void> => {
    await deletePatient(id)
    await refreshPatients()
  }

  useEffect(() => {
    void refreshPatients()
  }, [refreshPatients])

  return {
    patients,
    loading,
    error,
    refreshPatients,
    addPatient,
    editPatient,
    removePatient
  }
}