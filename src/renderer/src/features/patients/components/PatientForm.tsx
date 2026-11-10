import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import type { Patient, CreatePatientInput } from '../../../services/patient.api'
import type {
  CreatePaymentInput,
  PaymentRecord,
  UpdatePaymentInput
} from '../../../services/payment.api'

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

interface PatientFormProps {
  patient?: Patient | null
  onSubmit: (data: CreatePatientInput) => Promise<void>
  onAddPayment: (data: CreatePaymentInput) => Promise<PaymentRecord>
  onUpdatePayment: (id: number, data: UpdatePaymentInput) => Promise<PaymentRecord>
  onDeletePayment: (id: number) => Promise<void>
  onCancel: () => void
}

export default function PatientForm({
  patient,
  onSubmit,
  onAddPayment,
  onUpdatePayment,
  onDeletePayment,
  onCancel
}: PatientFormProps): React.JSX.Element {
  const [patientPayments, setPatientPayments] = useState<PaymentRecord[]>(patient?.payments ?? [])
  const [paymentAmount, setPaymentAmount] = useState('')
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null)
  const [editingPaymentAmount, setEditingPaymentAmount] = useState('')
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [savingPayment, setSavingPayment] = useState(false)
  const [activePaymentId, setActivePaymentId] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreatePatientInput>({
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      notes: ''
    }
  })

  useEffect(() => {
    reset({
      firstName: patient?.firstName ?? '',
      lastName: patient?.lastName ?? '',
      phone: patient?.phone ?? '',
      notes: patient?.notes ?? ''
    })
  }, [patient, reset])

  const handleAddPayment = async (): Promise<void> => {
    setPaymentError(null)
    const amount = Number(paymentAmount)
    const amountCents = Math.round(amount * 100)

    if (
      !Number.isFinite(amount) ||
      amountCents <= 0 ||
      Math.abs(amount * 100 - amountCents) > 1e-7
    ) {
      setPaymentError('Saisissez un montant positif avec au maximum deux décimales.')
      return
    }

    if (!patient) {
      return
    }

    try {
      setSavingPayment(true)
      const savedPayment = await onAddPayment({
        patientId: patient.id,
        amountCents
      })
      setPatientPayments((current) => [savedPayment, ...current])
      setPaymentAmount('')
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Impossible d’enregistrer le paiement.')
    } finally {
      setSavingPayment(false)
    }
  }

  const handleUpdatePayment = async (id: number): Promise<void> => {
    setPaymentError(null)
    const amount = Number(editingPaymentAmount)
    const amountCents = Math.round(amount * 100)

    if (
      !Number.isFinite(amount) ||
      amountCents <= 0 ||
      Math.abs(amount * 100 - amountCents) > 1e-7
    ) {
      setPaymentError('Saisissez un montant positif avec au maximum deux décimales.')
      return
    }

    try {
      setActivePaymentId(id)
      const updatedPayment = await onUpdatePayment(id, { amountCents })
      setPatientPayments((current) =>
        current.map((payment) => (payment.id === id ? updatedPayment : payment))
      )
      setEditingPaymentId(null)
      setEditingPaymentAmount('')
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Impossible de modifier le paiement.')
    } finally {
      setActivePaymentId(null)
    }
  }

  const handleDeletePayment = async (id: number): Promise<void> => {
    setPaymentError(null)

    try {
      setActivePaymentId(id)
      await onDeletePayment(id)
      setPatientPayments((current) => current.filter((payment) => payment.id !== id))
      if (editingPaymentId === id) {
        setEditingPaymentId(null)
        setEditingPaymentAmount('')
      }
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Impossible de supprimer le paiement.')
    } finally {
      setActivePaymentId(null)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-h-[75vh] space-y-4 overflow-y-auto">
      <div>
        <label>Prénom</label>
        <input
          {...register('firstName', {
            required: 'Le prénom est obligatoire',
            minLength: {
              value: 2,
              message: 'Minimum 2 caractères'
            }
          })}
          className="w-full rounded-lg border p-3"
          aria-invalid={Boolean(errors.firstName)}
          aria-describedby={errors.firstName ? 'firstName-error' : undefined}
          placeholder="Prénom du patient"
        />
        {errors.firstName && (
          <p id="firstName-error" className="patient-field-error">
            {errors.firstName.message}
          </p>
        )}
      </div>

      <div>
        <label>Nom</label>
        <input
          {...register('lastName', {
            required: 'Le nom est obligatoire',
            minLength: {
              value: 2,
              message: 'Minimum 2 caractères'
            }
          })}
          className="w-full rounded-lg border p-3"
          aria-invalid={Boolean(errors.lastName)}
          aria-describedby={errors.lastName ? 'lastName-error' : undefined}
          placeholder="Nom du patient"
        />
        {errors.lastName && (
          <p id="lastName-error" className="patient-field-error">
            {errors.lastName.message}
          </p>
        )}
      </div>

      <div>
        <label>Téléphone</label>
        <input
          {...register('phone', {
            required: 'Le téléphone est obligatoire',
            minLength: {
              value: 8,
              message: 'Numéro invalide'
            }
          })}
          className="w-full rounded-lg border p-3"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
          placeholder="Numéro de téléphone"
        />
        {errors.phone && (
          <p id="phone-error" className="patient-field-error">
            {errors.phone.message}
          </p>
        )}
      </div>

      {patient && (
        <section className="space-y-3 rounded-lg border p-4">
          <h3 className="font-semibold text-[#0B2D6B]">Historique des paiements</h3>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <label htmlFor="paymentAmount">Montant payé</label>
              <input
                id="paymentAmount"
                type="number"
                min="0.01"
                step="0.01"
                value={paymentAmount}
                onChange={(event) => setPaymentAmount(event.target.value)}
                className="w-full rounded-lg border p-3"
                placeholder="0,00"
              />
            </div>
            <button
              type="button"
              onClick={() => void handleAddPayment()}
              disabled={savingPayment}
              className="self-end rounded-lg bg-[#0B2D6B] px-4 py-3 text-white disabled:opacity-50"
            >
              {savingPayment ? 'Enregistrement...' : 'Ajouter'}
            </button>
          </div>

          {paymentError && <p className="text-sm text-red-600">{paymentError}</p>}

          {patientPayments.length > 0 ? (
            <ul className="divide-y">
              {patientPayments.map((payment) => (
                <li key={payment.id} className="flex items-center justify-between gap-3 py-2">
                  <span>{formatPaymentDate(payment.paymentDate)}</span>
                  {editingPaymentId === payment.id ? (
                    <>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={editingPaymentAmount}
                        onChange={(event) => setEditingPaymentAmount(event.target.value)}
                        className="w-28 rounded-lg border p-2"
                        aria-label="Nouveau montant du paiement"
                      />
                      <button
                        type="button"
                        onClick={() => void handleUpdatePayment(payment.id)}
                        disabled={activePaymentId === payment.id}
                        className="rounded p-2 text-green-700 hover:bg-green-50 disabled:opacity-50"
                        aria-label="Enregistrer le montant modifié"
                        title="Enregistrer"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPaymentId(null)
                          setEditingPaymentAmount('')
                          setPaymentError(null)
                        }}
                        disabled={activePaymentId === payment.id}
                        className="rounded p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        aria-label="Annuler la modification du paiement"
                        title="Annuler"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="ml-auto font-medium">
                        {formatPaidAmount(payment.amountCents)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPaymentId(payment.id)
                          setEditingPaymentAmount((payment.amountCents / 100).toFixed(2))
                          setPaymentError(null)
                        }}
                        disabled={activePaymentId === payment.id}
                        className="rounded p-2 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                        aria-label={`Modifier le paiement du ${formatPaymentDate(payment.paymentDate)}`}
                        title="Modifier le montant"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeletePayment(payment.id)}
                        disabled={activePaymentId === payment.id}
                        className="rounded p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        aria-label={`Supprimer le paiement du ${formatPaymentDate(payment.paymentDate)}`}
                        title="Supprimer le paiement"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Aucun paiement enregistré.</p>
          )}
        </section>
      )}

      <div>
        <label>Notes</label>
        <textarea
          {...register('notes')}
          className="w-full rounded-lg border p-3"
          rows={3}
          placeholder="Notes concernant le patient..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-3">
        <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2">
          Annuler
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-[#0B2D6B] px-5 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Enregistrement...' : patient ? 'Modifier' : 'Ajouter le patient'}
        </button>
      </div>
    </form>
  )
}
