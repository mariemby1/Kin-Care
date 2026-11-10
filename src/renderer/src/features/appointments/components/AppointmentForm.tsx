import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { CalendarDays, UserRound, Stethoscope, FileText } from 'lucide-react'

import { type Appointment, type CreateAppointmentInput } from '../../../services/appointment.api'

import { createPatient, getAllPatients, type Patient } from '../../../services/patient.api'

interface AppointmentFormProps {
  appointment?: Appointment | null
  initialDate?: Date | null
  onSubmit: (data: CreateAppointmentInput) => Promise<void>
  onCancel: () => void
}

interface AppointmentFormValues {
  patientFirstName: string
  patientLastName: string
  patientPhone: string
  patientNotes: string
  appointmentDate: string
  appointmentTime: string
  treatment: string
  status: 'confirmed' | 'cancelled'
  notes: string
}

function toLocalDateTime(value: Date | string): string {
  const date = new Date(value)

  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60000)

  return localDate.toISOString().slice(0, 16)
}

export default function AppointmentForm({
  appointment,
  initialDate,
  onSubmit,
  onCancel
}: AppointmentFormProps): React.JSX.Element {
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientsLoading, setPatientsLoading] = useState(true)
  const [patientsError, setPatientsError] = useState<string | null>(null)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, dirtyFields }
  } = useForm<AppointmentFormValues>({
    defaultValues: {
      patientFirstName: '',
      patientLastName: '',
      patientPhone: '',
      patientNotes: '',
      appointmentDate: '',
      appointmentTime: '',
      treatment: '',
      status: 'confirmed',
      notes: ''
    }
  })
  const patientFirstNameField = register('patientFirstName', {
    required: 'Le prénom est obligatoire',
    validate: (value) => value.trim().length >= 2 || 'Minimum 2 caractères'
  })
  const patientLastNameField = register('patientLastName', {
    required: 'Le nom est obligatoire',
    validate: (value) => value.trim().length >= 2 || 'Minimum 2 caractères'
  })
  const patientFirstName = watch('patientFirstName')
  const patientLastName = watch('patientLastName')
  const normalizeName = (value: string): string => value.trim().toLocaleLowerCase('fr-FR')
  const patientQuery = normalizeName(`${patientFirstName} ${patientLastName}`)
  const matchingPatients =
    patientQuery.length >= 2
      ? patients.filter((patient) =>
          normalizeName(`${patient.firstName} ${patient.lastName}`).includes(patientQuery)
        )
      : []
  const exactPatient = patients.find(
    (patient) =>
      normalizeName(patient.firstName) === normalizeName(patientFirstName) &&
      normalizeName(patient.lastName) === normalizeName(patientLastName)
  )
  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId)

  const selectPatient = (patient: Patient): void => {
    setSelectedPatientId(patient.id)
    setValue('patientFirstName', patient.firstName, { shouldValidate: true })
    setValue('patientLastName', patient.lastName, { shouldValidate: true })
    setValue('patientPhone', patient.phone, { shouldValidate: true })
    setValue('patientNotes', patient.notes ?? '', { shouldValidate: true })
  }

  useEffect(() => {
    let active = true

    const loadPatients = async (): Promise<void> => {
      try {
        setPatientsLoading(true)
        setPatientsError(null)

        const data = await getAllPatients()

        if (active) {
          setPatients(data)
        }
      } catch {
        if (active) {
          setPatientsError('Impossible de charger les patients.')
        }
      } finally {
        if (active) {
          setPatientsLoading(false)
        }
      }
    }

    void loadPatients()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    setSelectedPatientId(null)
    reset({
      patientFirstName: appointment?.patientFirstName ?? '',
      patientLastName: appointment?.patientLastName ?? '',
      patientPhone: '',
      patientNotes: '',
      appointmentDate: appointment
        ? toLocalDateTime(appointment.appointmentDate).slice(0, 10)
        : initialDate
          ? toLocalDateTime(initialDate).slice(0, 10)
          : '',
      appointmentTime: appointment
        ? toLocalDateTime(appointment.appointmentDate).slice(11, 16)
        : initialDate
          ? toLocalDateTime(initialDate).slice(11, 16)
          : '',
      treatment: appointment?.treatment ?? '',
      status: appointment?.status ?? 'confirmed',
      notes: appointment?.notes ?? ''
    })
  }, [appointment, initialDate, reset])

  useEffect(() => {
    if (!exactPatient) {
      return
    }

    setSelectedPatientId(exactPatient.id)
    setValue('patientPhone', exactPatient.phone, { shouldValidate: true })
    setValue('patientNotes', exactPatient.notes ?? '', { shouldValidate: true })
  }, [exactPatient, setValue])

  useEffect(() => {
    if (!appointment || patientsLoading) {
      return
    }

    const existingPatient = patients.find((patient) => patient.id === appointment.patientId)

    if (!existingPatient) {
      return
    }

    if (!dirtyFields.patientFirstName) {
      setValue('patientFirstName', existingPatient.firstName)
    }
    if (!dirtyFields.patientLastName) {
      setValue('patientLastName', existingPatient.lastName)
    }
    if (!dirtyFields.patientPhone) {
      setValue('patientPhone', existingPatient.phone)
    }
    if (!dirtyFields.patientNotes) {
      setValue('patientNotes', existingPatient.notes ?? '')
    }
    setSelectedPatientId(existingPatient.id)
  }, [appointment, dirtyFields, patients, patientsLoading, setValue])

  const submitForm = async (values: AppointmentFormValues): Promise<void> => {
    setSubmissionError(null)
    const firstName = values.patientFirstName.trim()
    const lastName = values.patientLastName.trim()
    const existingPatient = patients.find(
      (item) =>
        normalizeName(item.firstName) === normalizeName(firstName) &&
        normalizeName(item.lastName) === normalizeName(lastName)
    )

    let patientId = existingPatient?.id

    if (patientId === undefined) {
      try {
        const newPatient = await createPatient({
          firstName,
          lastName,
          phone: values.patientPhone.trim(),
          notes: values.patientNotes.trim() || null
        })
        patientId = newPatient.id
        setPatients((currentPatients) => [...currentPatients, newPatient])
      } catch (error) {
        setSubmissionError(
          error instanceof Error ? error.message : 'Impossible de créer le patient.'
        )
        return
      }
    }

    await onSubmit({
      patientId,
      appointmentDate: new Date(`${values.appointmentDate}T${values.appointmentTime}`),
      treatment: values.treatment.trim(),
      status: values.status,
      notes: values.notes.trim() || null
    })
  }

  return (
    <form onSubmit={handleSubmit(submitForm)} className="appointment-form">
      {/* PATIENT */}
      <div>
        <label>
          <UserRound size={15} />
          Patient <span>(prénom et nom obligatoires)</span>
        </label>

        <div className="appointment-patient-search">
          <div className="appointment-form-row">
            <div>
              <label htmlFor="patientFirstName">Prénom</label>
              <input
                id="patientFirstName"
                {...patientFirstNameField}
                onChange={(event) => {
                  if (selectedPatientId !== null) {
                    setSelectedPatientId(null)
                    setValue('patientPhone', '')
                    setValue('patientNotes', '')
                  }
                  void patientFirstNameField.onChange(event)
                }}
                className="appointment-form-control"
                autoComplete="given-name"
              />
              {errors.patientFirstName && (
                <p className="appointment-form-error">{errors.patientFirstName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="patientLastName">Nom</label>
              <input
                id="patientLastName"
                {...patientLastNameField}
                onChange={(event) => {
                  if (selectedPatientId !== null) {
                    setSelectedPatientId(null)
                    setValue('patientPhone', '')
                    setValue('patientNotes', '')
                  }
                  void patientLastNameField.onChange(event)
                }}
                className="appointment-form-control"
                autoComplete="family-name"
              />
              {errors.patientLastName && (
                <p className="appointment-form-error">{errors.patientLastName.message}</p>
              )}
            </div>
          </div>

          {!exactPatient && matchingPatients.length > 0 && (
            <div
              className="appointment-patient-suggestions"
              role="listbox"
              aria-label="Patients existants"
            >
              {matchingPatients.slice(0, 6).map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  className="appointment-patient-suggestion"
                  onClick={() => selectPatient(patient)}
                >
                  <strong>
                    {patient.firstName} {patient.lastName}
                  </strong>
                  <span>{patient.phone || 'Téléphone non renseigné'}</span>
                  {patient.notes && <small>{patient.notes}</small>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="appointment-form-row appointment-patient-optional-fields">
          <div>
            <label htmlFor="patientPhone">Téléphone (facultatif)</label>
            <input
              id="patientPhone"
              type="tel"
              {...register('patientPhone', {
                validate: (value) =>
                  !value.trim() ||
                  (value.trim().length >= 8 && value.trim().length <= 20) ||
                  'Le téléphone doit contenir entre 8 et 20 caractères'
              })}
              className="appointment-form-control"
              autoComplete="tel"
            />
            {errors.patientPhone && (
              <p className="appointment-form-error">{errors.patientPhone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="patientNotes">Notes patient (facultatives)</label>
            <input
              id="patientNotes"
              {...register('patientNotes', {
                maxLength: {
                  value: 2000,
                  message: 'Maximum 2000 caractères'
                }
              })}
              className="appointment-form-control"
            />
            {errors.patientNotes && (
              <p className="appointment-form-error">{errors.patientNotes.message}</p>
            )}
          </div>
        </div>

        {selectedPatient && (
          <div className="appointment-patient-selected" aria-live="polite">
            <strong>Patient existant sélectionné</strong>
            <span>
              {selectedPatient.firstName} {selectedPatient.lastName}
            </span>
            <span>Téléphone : {selectedPatient.phone || 'non renseigné'}</span>
            {selectedPatient.notes && <span>Notes : {selectedPatient.notes}</span>}
          </div>
        )}

        {patientsError && <p className="appointment-form-error">{patientsError}</p>}

        {patientsLoading && (
          <p className="appointment-form-warning">Chargement des patients existants...</p>
        )}

        {submissionError && <p className="appointment-form-error">{submissionError}</p>}
      </div>

      {/* DATE */}
      <div>
        <label>
          <CalendarDays size={15} />
          Date et heure
        </label>

        <div className="appointment-form-row">
          <div>
            <label htmlFor="appointmentDate">Date</label>
            <input
              id="appointmentDate"
              type="date"
              lang="fr-FR"
              {...register('appointmentDate', {
                required: 'La date est obligatoire'
              })}
              className="appointment-form-control"
            />
            {errors.appointmentDate && (
              <p className="appointment-form-error">{errors.appointmentDate.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="appointmentTime">Heure (24 h)</label>
            <input
              id="appointmentTime"
              type="text"
              inputMode="numeric"
              placeholder="HH:MM"
              maxLength={5}
              {...register('appointmentTime', {
                required: "L'heure est obligatoire",
                pattern: {
                  value: /^(?:[01]\d|2[0-3]):[0-5]\d$/,
                  message: 'Saisissez une heure au format 24 h, par exemple 14:35'
                },
                validate: (value) => {
                  const dateTime = new Date(`${watch('appointmentDate')}T${value}`)
                  return (
                    (!Number.isNaN(dateTime.getTime()) && dateTime.getTime() > Date.now()) ||
                    'Choisissez une date et une heure futures'
                  )
                }
              })}
              className="appointment-form-control"
              autoComplete="off"
              aria-describedby="appointmentTimeHint"
            />
            <p id="appointmentTimeHint" className="appointment-form-hint">
              Saisissez les heures et minutes manuellement (ex. 14:35).
            </p>
            {errors.appointmentTime && (
              <p className="appointment-form-error">{errors.appointmentTime.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* TREATMENT */}
      <div>
        <label>
          <Stethoscope size={15} />
          Type de traitement
        </label>

        <input
          {...register('treatment', {
            required: 'Le traitement est obligatoire',
            minLength: {
              value: 2,
              message: 'Minimum 2 caractères'
            },
            maxLength: {
              value: 200,
              message: 'Maximum 200 caractères'
            }
          })}
          className="appointment-form-control"
          placeholder="Ex : Rééducation fonctionnelle"
        />

        {errors.treatment && <p className="appointment-form-error">{errors.treatment.message}</p>}
      </div>

      {/* STATUS */}
      <div>
        <label>Statut du rendez-vous</label>

        <select {...register('status', { required: true })} className="appointment-form-control">
          <option value="confirmed">Confirmé</option>
          <option value="cancelled">Annulé</option>
        </select>
      </div>

      {/* NOTES */}
      <div>
        <label>
          <FileText size={15} />
          Notes complémentaires
        </label>

        <textarea
          {...register('notes', {
            maxLength: {
              value: 2000,
              message: 'Maximum 2000 caractères'
            }
          })}
          rows={3}
          className="appointment-form-control"
          placeholder="Informations complémentaires..."
        />

        {errors.notes && <p className="appointment-form-error">{errors.notes.message}</p>}
      </div>

      {/* ACTIONS */}
      <div className="appointment-form-actions">
        <button type="button" onClick={onCancel} className="appointment-secondary-button">
          Annuler
        </button>

        <button
          type="submit"
          disabled={isSubmitting || patientsLoading || Boolean(patientsError)}
          className="appointment-submit-button"
        >
          {isSubmitting
            ? 'Enregistrement...'
            : appointment
              ? 'Enregistrer les modifications'
              : 'Créer le rendez-vous'}
        </button>
      </div>
    </form>
  )
}
