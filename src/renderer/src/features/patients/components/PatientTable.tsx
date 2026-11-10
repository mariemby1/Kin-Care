import { useState } from 'react'
import { ChevronLeft, ChevronRight, Pencil, Trash2, Search, Users } from 'lucide-react'
import type { Patient } from '../../../services/patient.api'

const PAGE_SIZE = 10

function formatPaidAmount(amountCents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amountCents / 100)
}

function formatPaymentDate(value: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

interface PatientTableProps {
  patients: Patient[]
  search: string
  onSearchChange: (value: string) => void
  onEdit: (patient: Patient) => void
  onDelete: (patient: Patient) => void
}

export default function PatientTable({
  patients,
  search,
  onSearchChange,
  onEdit,
  onDelete
}: PatientTableProps): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(patients.length / PAGE_SIZE))
  const page = Math.min(currentPage, pageCount)
  const startIndex = (page - 1) * PAGE_SIZE
  const visiblePatients = patients.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <div className="content-card">
      <div className="card-header">
        <div>
          <h3>Liste des patients</h3>
          <p>
            {patients.length === 0
              ? 'Aucun patient'
              : `${startIndex + 1}-${Math.min(
                  startIndex + PAGE_SIZE,
                  patients.length
                )} sur ${patients.length} patient(s)`}
          </p>
        </div>
      </div>

      <div className="search-box mb-5">
        <Search size={18} />
        <input
          value={search}
          onChange={(e) => {
            setCurrentPage(1)
            onSearchChange(e.target.value)
          }}
          placeholder="Rechercher un patient..."
        />
      </div>

      <div className="patient-table-container">
        <table className="patient-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Téléphone</th>
              <th>Séances effectuées</th>
              <th>Total payé</th>
              <th>Dates et montants des paiements</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {visiblePatients.map((patient) => (
              <tr key={patient.id}>
                <td className="patient-name">{patient.lastName}</td>
                <td className="patient-name">{patient.firstName}</td>
                <td>{patient.phone}</td>
                <td>{patient.completedSessions}</td>
                <td>{formatPaidAmount(patient.totalPaidCents)}</td>
                <td>
                  {patient.payments.length > 0 ? (
                    <ul className="space-y-1">
                      {patient.payments.map((payment) => (
                        <li key={payment.id}>
                          {formatPaymentDate(payment.paymentDate)} —{' '}
                          {formatPaidAmount(payment.amountCents)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    '-'
                  )}
                </td>
                <td>{patient.notes || '-'}</td>

                <td>
                  <div className="patient-action-buttons">
                    <button
                      onClick={() => onEdit(patient)}
                      className="patient-action-btn patient-edit-btn"
                      title="Modifier le patient"
                      aria-label="Modifier le patient"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => onDelete(patient)}
                      className="patient-action-btn patient-delete-btn"
                      title="Supprimer le patient"
                      aria-label="Supprimer le patient"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {visiblePatients.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <Users size={30} />
                  Aucun patient trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {patients.length > PAGE_SIZE && (
        <nav className="patient-pagination" aria-label="Pagination des patients">
          <button
            type="button"
            className="patient-pagination-btn"
            onClick={() => setCurrentPage(page - 1)}
            disabled={page === 1}
            aria-label="Page précédente"
          >
            <ChevronLeft size={16} />
            Précédent
          </button>

          <span>
            Page {page} sur {pageCount}
          </span>

          <button
            type="button"
            className="patient-pagination-btn"
            onClick={() => setCurrentPage(page + 1)}
            disabled={page === pageCount}
            aria-label="Page suivante"
          >
            Suivant
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
    </div>
  )
}
