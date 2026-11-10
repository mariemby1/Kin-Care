import { AlertTriangle } from 'lucide-react'
import type { Patient } from '../../../services/patient.api'

interface DeletePatientDialogProps {
  patient: Patient | null
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export default function DeletePatientDialog({
  patient,
  onConfirm,
  onCancel
}: DeletePatientDialogProps): React.JSX.Element | null {
  if (!patient) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-3 text-red-600">
              <AlertTriangle size={22} />
            </div>
            <h2 className="text-lg font-bold text-[#0B2D6B]">
              Supprimer le patient
            </h2>
          </div>

        </div>

        <p className="mb-6 text-sm text-gray-600">
          Voulez-vous vraiment supprimer{' '}
          <strong>
            {patient.firstName} {patient.lastName}
          </strong>
          ? Cette action est irréversible.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={() => void onConfirm()}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
