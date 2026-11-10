import { useEffect, useState } from 'react'
import { getTodayAppointments } from '../../../services/appointment.api'
import type { Appointment } from '../../../services/appointment.api'

export interface DashboardAppointment {
  id: number
  name: string
  time: string
  treatment: string
  status: 'Confirmé' | 'Annulé'
}

export interface DashboardActivity {
  title: string
  description: string
  time: string
  icon: 'user' | 'check' | 'calendar' | 'file'
  color: 'blue' | 'green' | 'purple' | 'orange'
}

export function useDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())

  const [appointments, setAppointments] =
    useState<DashboardAppointment[]>([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let active = true

    async function loadAppointments() {
      try {
        setLoading(true)
        setError(null)

        const data: Appointment[] = await getTodayAppointments()

        if (!active) return

        const mappedAppointments: DashboardAppointment[] = data.map((appointment) => ({
          id: appointment.id,
          
          name: [
            appointment.patientFirstName,
            appointment.patientLastName
            ]
            .filter(Boolean)
            .join(' ') || `Patient #${appointment.patientId}`,
          time: new Date(appointment.appointmentDate).toLocaleTimeString(
            'fr-FR',
            {
              hour: '2-digit',
              minute: '2-digit'
            }
          ),
          treatment: appointment.treatment,
          status: appointment.status === 'confirmed' ? 'Confirmé' : 'Annulé'
        }))

        setAppointments(mappedAppointments)
      } catch (err) {
        console.error('Failed to load appointments:', err)

        if (active) {
          setError('Impossible de charger les rendez-vous.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadAppointments()

    return () => {
      active = false
    }
  }, [])

  const formattedTime = currentTime.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  const formattedDate = currentTime.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const recentActivities: DashboardActivity[] = []

  return {
    currentTime,
    formattedTime,
    formattedDate,
    appointments,
    recentActivities,
    loading,
    error
  }
}
