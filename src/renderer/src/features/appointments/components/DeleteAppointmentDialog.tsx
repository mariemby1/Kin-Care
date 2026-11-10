import { AlertTriangle, X, Trash2 } from 'lucide-react'
import type { Appointment } from '../../../services/appointment.api'

interface DeleteAppointmentDialogProps {
  appointment: Appointment | null
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export default function DeleteAppointmentDialog({
  appointment,
  onConfirm,
  onCancel
}: DeleteAppointmentDialogProps): React.JSX.Element | null {
  if (!appointment) return null

  const [firstName, lastName] = [
    appointment.patientFirstName ?? 'Patient',
    appointment.patientLastName ?? ''
  ]

  return (
    <div className="appointment-modal-backdrop">
      <div className="appointment-delete-dialog">
        <div className="appointment-delete-dialog-top">
          <div className="appointment-delete-icon">
            <AlertTriangle size={25} />
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="appointment-modal-close"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <h2>Supprimer le rendez-vous ?</h2>

        <p>
          Vous êtes sur le point de supprimer le rendez-vous de{' '}
          <strong>
            {firstName} {lastName}
          </strong>
          . Cette action est irréversible.
        </p>

        <div className="appointment-form-actions">
          <button type="button" onClick={onCancel} className="appointment-secondary-button">
            Annuler
          </button>

          <button
            type="button"
            onClick={() => void onConfirm()}
            className="appointment-danger-button"
          >
            <Trash2 size={16} />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
