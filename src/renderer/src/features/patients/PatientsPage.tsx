import { useMemo, useState } from 'react'
import { Plus, RefreshCw, Users } from 'lucide-react'

import { usePatients } from './hooks/usePatients'
import PatientForm from './components/PatientForm'
import PatientTable from './components/PatientTable'
import DeletePatientDialog from './components/DeletePatientDialog'
import { createPayment, deletePayment, updatePayment } from '../../services/payment.api'

import type {
  Patient,
  CreatePatientInput
} from '../../services/patient.api'
import type {
  CreatePaymentInput,
  PaymentRecord,
  UpdatePaymentInput
} from '../../services/payment.api'

export default function PatientsPage(): React.JSX.Element {
  const {
    patients,
    loading,
    error,
    refreshPatients,
    addPatient,
    editPatient,
    removePatient
  } = usePatients()

  const [showForm, setShowForm] = useState(false)
  const [selectedPatient, setSelectedPatient] =
    useState<Patient | null>(null)

  const [patientToDelete, setPatientToDelete] =
    useState<Patient | null>(null)

  const [search, setSearch] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return patients

    return patients.filter((patient) =>
      `${patient.firstName} ${patient.lastName} ${patient.phone}`
        .toLowerCase()
        .includes(query)
    )
  }, [patients, search])

  const handleSubmit = async (
    data: CreatePatientInput
  ): Promise<void> => {
    try {
      setActionError(null)

      if (selectedPatient) {
        await editPatient(selectedPatient.id, data)
      } else {
        await addPatient(data)
      }

      setShowForm(false)
      setSelectedPatient(null)
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue.'
      )
    }
  }

  const handleDelete = async (): Promise<void> => {
    if (!patientToDelete) return

    try {
      setActionError(null)
      await removePatient(patientToDelete.id)
      setPatientToDelete(null)
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'Impossible de supprimer ce patient.'
      )
    }
  }

  const handleAddPayment = async (data: CreatePaymentInput): Promise<PaymentRecord> => {
    const payment = await createPayment(data)
    await refreshPatients()
    return payment
  }

  const handleDeletePayment = async (id: number): Promise<void> => {
    await deletePayment(id)
    await refreshPatients()
  }

  const handleUpdatePayment = async (
    id: number,
    data: UpdatePaymentInput
  ): Promise<PaymentRecord> => {
    const payment = await updatePayment(id, data)
    await refreshPatients()
    return payment
  }

  const openEdit = (patient: Patient): void => {
    setSelectedPatient(patient)
    setShowForm(true)
  }

  const openCreate = (): void => {
    setSelectedPatient(null)
    setShowForm(true)
  }

  return (
    <div className="patients-page">

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0B2D6B]">
            Gestion des patients
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les dossiers de vos patients.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => void refreshPatients()}
            className="icon-button"
            title="Actualiser"
          >
            <RefreshCw size={18} />
          </button>

          <button
            onClick={openCreate}
            className="primary-button"
          >
            <Plus size={17} />
            Ajouter un patient
          </button>
        </div>
      </div>

      <div className="appointment-summary">
        <div className="summary-icon">
          <Users size={25} />
        </div>

        <div className="summary-content">
          <span className="summary-label">
            Total des patients
          </span>

          <h2>{patients.length}</h2>

          <span className="summary-upcoming">
            Patients enregistrés
          </span>
        </div>
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {actionError}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="content-card py-12 text-center text-gray-500">
          Chargement des patients...
        </div>
      ) : (
        <PatientTable
          patients={filteredPatients}
          search={search}
          onSearchChange={setSearch}
          onEdit={openEdit}
          onDelete={setPatientToDelete}
        />
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-6 text-xl font-bold text-[#0B2D6B]">
              {selectedPatient
                ? 'Modifier le patient'
                : 'Ajouter un patient'}
            </h2>

            <PatientForm
              patient={selectedPatient}
              onSubmit={handleSubmit}
              onAddPayment={handleAddPayment}
              onUpdatePayment={handleUpdatePayment}
              onDeletePayment={handleDeletePayment}
              onCancel={() => {
                setShowForm(false)
                setSelectedPatient(null)
              }}
            />
          </div>
        </div>
      )}

      <DeletePatientDialog
        patient={patientToDelete}
        onConfirm={handleDelete}
        onCancel={() => setPatientToDelete(null)}
      />

    </div>
  )
}
