import { CalendarDays, Clock, Pencil, Trash2, UserRound } from 'lucide-react'

import type { Appointment } from '../../../services/appointment.api'

interface AppointmentTableProps {
  appointments: Appointment[]
  onEdit: (appointment: Appointment) => void
  onDelete: (appointment: Appointment) => void
}

const statusConfig = {
  confirmed: {
    label: 'Confirmé',
    className: 'confirmed'
  },
  cancelled: {
    label: 'Annulé',
    className: 'cancelled'
  }
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(value))
}

function formatTime(value: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

export default function AppointmentTable({
  appointments,
  onEdit,
  onDelete
}: AppointmentTableProps): React.JSX.Element {
  return (
    <div className="appointment-table-container">
      <table className="appointment-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Date</th>
            <th>Traitement</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {appointments.map((appointment) => {
            const status = statusConfig[appointment.status]

            return (
              <tr key={appointment.id} className="">
                <td>
                  <div className="appointment-table-patient">
                    <div className="appointment-table-avatar">
                      <UserRound size={19} />
                    </div>

                    <div>
                      <p>
                        {appointment.patientFirstName ?? 'Patient'}{' '}
                        {appointment.patientLastName ?? ''}
                      </p>
                      <p className="appointment-table-patient-id">#{appointment.patientId}</p>
                    </div>
                  </div>
                </td>

                <td>
                  <div className="appointment-table-date">
                    <CalendarDays size={16} />
                    {formatDate(appointment.appointmentDate)}
                  </div>

                  <div className="appointment-table-time">
                    <Clock size={14} />
                    {formatTime(appointment.appointmentDate)}
                  </div>
                </td>

                <td>{appointment.treatment}</td>

                <td>
                  <span className={`appointment-table-status ${status.className}`}>
                    {status.label}
                  </span>
                </td>

                <td>
                  <div className="appointment-table-actions">
                    <button
                      type="button"
                      onClick={() => onEdit(appointment)}
                      title="Modifier"
                      aria-label="Modifier le rendez-vous"
                      className="appointment-edit-button"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(appointment)}
                      title="Supprimer"
                      aria-label="Supprimer le rendez-vous"
                      className="appointment-delete-button"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}

          {appointments.length === 0 && (
            <tr>
              <td colSpan={5} className="appointment-table-empty">
                <CalendarDays size={38} className="appointment-empty-icon" />

                <p>Aucun rendez-vous trouvé</p>

                <p>Les rendez-vous apparaîtront ici.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
