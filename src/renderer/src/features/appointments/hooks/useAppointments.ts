import { useCallback, useEffect, useState } from 'react'

import {
  getAllAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  type Appointment,
  type CreateAppointmentInput,
  type UpdateAppointmentInput
} from '../../../services/appointment.api'

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // LOAD APPOINTMENTS
  const refreshAppointments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getAllAppointments()
      setAppointments(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de charger les rendez-vous.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  // CREATE APPOINTMENT
  const addAppointment = async (
    data: CreateAppointmentInput
  ): Promise<void> => {
    await createAppointment(data)
    await refreshAppointments()
  }

  // UPDATE APPOINTMENT
  const editAppointment = async (
    id: number,
    data: UpdateAppointmentInput
  ): Promise<void> => {
    await updateAppointment(id, data)
    await refreshAppointments()
  }

  // DELETE APPOINTMENT
  const removeAppointment = async (
    id: number
  ): Promise<void> => {
    await deleteAppointment(id)
    await refreshAppointments()
  }

  useEffect(() => {
    void refreshAppointments()
  }, [refreshAppointments])

  return {
    appointments,
    loading,
    error,
    refreshAppointments,
    addAppointment,
    editAppointment,
    removeAppointment
  }
}