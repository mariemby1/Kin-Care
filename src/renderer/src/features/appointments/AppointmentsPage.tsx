import { useMemo, useState } from 'react'
import { CheckCircle2, AlertCircle, Search, X, RefreshCw } from 'lucide-react'

import { type Appointment, type AppointmentStatus } from '../../services/appointment.api'

import { useAppointments } from './hooks/useAppointments'
import { usePayments } from './hooks/usePayments'
import AppointmentForm from './components/AppointmentForm'
import AppointmentTable from './components/AppointmentTable'
import AppointmentCalendar from './components/AppointmentCalendar'
import DeleteAppointmentDialog from './components/DeleteAppointmentDialog'

type StatusFilter = 'all' | AppointmentStatus

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'confirmed', label: 'Confirmés' },
  { value: 'cancelled', label: 'Annulés' }
]

export default function AppointmentsPage(): React.JSX.Element {
  const {
    appointments,
    loading,
    error,
    refreshAppointments,
    addAppointment,
    editAppointment,
    removeAppointment
  } = useAppointments()
  const { payments, error: paymentError } = usePayments()

  const [formOpen, setFormOpen] = useState(false)

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null)

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const [initialAppointmentDate, setInitialAppointmentDate] = useState<Date | null>(null)

  const [search, setSearch] = useState('')

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const [actionError, setActionError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase()

    return appointments.filter((appointment) => {
      const patientName = [appointment.patientFirstName ?? '', appointment.patientLastName ?? '']
        .join(' ')
        .toLowerCase()

      const matchesSearch =
        !query ||
        patientName.includes(query) ||
        appointment.treatment.toLowerCase().includes(query) ||
        String(appointment.patientId).includes(query)

      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [appointments, search, statusFilter])

  const openCreateForm = (date: Date = selectedDate): void => {
    setSelectedAppointment(null)
    const appointmentDate = new Date(date)
    appointmentDate.setHours(8, 0, 0, 0)
    setInitialAppointmentDate(appointmentDate)
    setActionError(null)
    setNotice(null)
    setFormOpen(true)
  }

  const openEditForm = (appointment: Appointment): void => {
    setSelectedAppointment(appointment)
    setInitialAppointmentDate(null)
    setActionError(null)
    setNotice(null)
    setFormOpen(true)
  }

  const closeForm = (): void => {
    setFormOpen(false)
    setSelectedAppointment(null)
    setInitialAppointmentDate(null)
    setActionError(null)
  }

  const handleFormSubmit = async (data: Parameters<typeof addAppointment>[0]): Promise<void> => {
    try {
      setActionError(null)

      if (selectedAppointment) {
        await editAppointment(selectedAppointment.id, data)
        setNotice('Le rendez-vous a été modifié avec succès.')
      } else {
        await addAppointment(data)
        setNotice('Le rendez-vous a été créé avec succès.')
      }

      closeForm()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    }
  }

  const handleDelete = async (): Promise<void> => {
    if (!appointmentToDelete) return

    try {
      setDeleting(true)
      setActionError(null)

      await removeAppointment(appointmentToDelete.id)

      setAppointmentToDelete(null)
      setNotice('Le rendez-vous a été supprimé avec succès.')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Impossible de supprimer ce rendez-vous.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="appointments-page">
      {/* APPOINTMENT CALENDAR */}
      <AppointmentCalendar
        appointments={appointments}
        payments={payments}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onAddAppointment={openCreateForm}
      />

      {/* NOTIFICATIONS */}
      {notice && (
        <div className="appointment-notice appointment-notice-success">
          <div>
            <CheckCircle2 size={18} />
            {notice}
          </div>

          <button type="button" onClick={() => setNotice(null)} aria-label="Fermer le message">
            <X size={17} />
          </button>
        </div>
      )}

      {(actionError || error || paymentError) && (
        <div className="appointment-notice appointment-notice-error">
          <AlertCircle size={18} />
          {actionError || error || paymentError}
        </div>
      )}

      {/* APPOINTMENT TABLE */}
      <section className="appointment-list-card">
        <div className="appointment-list-header">
          <div>
            <h3>Liste des rendez-vous</h3>

            <p>{filteredAppointments.length} rendez-vous affiché(s)</p>
          </div>

          <div className="appointment-list-controls">
            {/* SEARCH */}
            <div className="appointment-search">
              <Search size={18} />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un patient..."
              />
            </div>

            {/* FILTER */}
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="appointment-status-filter"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* REFRESH */}
            <button
              type="button"
              onClick={() => void refreshAppointments()}
              disabled={loading}
              title="Actualiser"
              aria-label="Actualiser les rendez-vous"
              className="appointment-refresh-button"
            >
              <RefreshCw size={18} className={loading ? 'appointment-spinning' : ''} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="appointment-loading">
            <RefreshCw size={30} className="appointment-spinning" />
            <p>Chargement des rendez-vous...</p>
          </div>
        ) : (
          <AppointmentTable
            appointments={filteredAppointments}
            onEdit={openEditForm}
            onDelete={setAppointmentToDelete}
          />
        )}
      </section>

      {/* CREATE / EDIT MODAL */}
      {formOpen && (
        <div
          className="appointment-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm()
          }}
        >
          <div className="appointment-modal">
            <div className="appointment-modal-header">
              <div>
                <h3>{selectedAppointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}</h3>

                <p>Complétez les informations du rendez-vous.</p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="appointment-modal-close"
                aria-label="Fermer"
              >
                <X size={21} />
              </button>
            </div>

            <div className="appointment-modal-body">
              <AppointmentForm
                appointment={selectedAppointment}
                initialDate={initialAppointmentDate}
                onSubmit={handleFormSubmit}
                onCancel={closeForm}
              />
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      <DeleteAppointmentDialog
        appointment={appointmentToDelete}
        onConfirm={handleDelete}
        onCancel={() => setAppointmentToDelete(null)}
      />

      {deleting && <div className="appointment-deleting">Suppression en cours...</div>}
    </div>
  )
}
