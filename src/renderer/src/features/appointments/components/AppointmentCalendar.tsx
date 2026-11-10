import { useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Plus,
  CheckCircle2,
  XCircle
} from 'lucide-react'

import type { Appointment, AppointmentStatus } from '../../../services/appointment.api'
import type { PaymentRecord } from '../../../services/payment.api'

interface Props {
  appointments: Appointment[]
  payments: PaymentRecord[]
  selectedDate: Date
  onSelectDate: (date: Date) => void
  onAddAppointment?: (date?: Date) => void
}

const MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre'
]

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const SCHEDULE_START_HOUR = 8
const SCHEDULE_END_HOUR = 22
const SCHEDULE_SLOT_COUNT = (SCHEDULE_END_HOUR - SCHEDULE_START_HOUR) * 2

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function getLocalDate(value: Date | string): Date {
  const date = new Date(value)

  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatTime(value: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).format(new Date(value))
}

function getStatus(
  status: AppointmentStatus
): { label: string; icon: typeof CheckCircle2 | typeof XCircle } {
  if (status === 'confirmed') {
    return { label: 'Confirmé', icon: CheckCircle2 }
  }

  return { label: 'Annulé', icon: XCircle }
}

export default function AppointmentCalendar({
  appointments,
  payments,
  selectedDate,
  onSelectDate,
  onAddAppointment
}: Props): React.JSX.Element {
  const [currentMonth, setCurrentMonth] = useState(() => {
    return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  })

  const today = new Date()

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Lundi = 0, dimanche = 6
    const offset = (firstDay.getDay() + 6) % 7

    const totalCells = Math.ceil((offset + lastDay.getDate()) / 7) * 7

    return Array.from({ length: totalCells }, (_, index) => {
      const date = new Date(year, month, index - offset + 1)

      const dayAppointments = appointments.filter((item) =>
        sameDay(getLocalDate(item.appointmentDate), date)
      )

      return {
        date,
        currentMonth: date.getMonth() === month,
        appointments: dayAppointments
      }
    })
  }, [currentMonth, appointments])

  const selectedAppointments = useMemo(
    () => appointments.filter((item) => sameDay(getLocalDate(item.appointmentDate), selectedDate)),
    [appointments, selectedDate]
  )
  const selectedPayments = useMemo(
    () => payments.filter((item) => sameDay(getLocalDate(item.paymentDate), selectedDate)),
    [payments, selectedDate]
  )
  const paymentsByAppointment = (() => {
    const currentTime = today.getTime()
    const appointmentByPatient = new Map<number, number>()

    for (const appointment of [...selectedAppointments].sort(
      (a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
    )) {
      if (
        appointment.status === 'confirmed' &&
        new Date(appointment.appointmentDate).getTime() < currentTime
      ) {
        appointmentByPatient.set(appointment.patientId, appointment.id)
      }
    }

    const groupedPayments = new Map<number, PaymentRecord[]>()
    for (const payment of selectedPayments) {
      const appointmentId = appointmentByPatient.get(payment.patientId)
      if (appointmentId === undefined) {
        continue
      }

      const appointmentPayments = groupedPayments.get(appointmentId) ?? []
      appointmentPayments.push(payment)
      groupedPayments.set(appointmentId, appointmentPayments)
    }

    return groupedPayments
  })()

  const scheduleSlots = useMemo(
    () =>
      Array.from({ length: SCHEDULE_SLOT_COUNT }, (_, index) => {
        const startMinutes = SCHEDULE_START_HOUR * 60 + index * 30
        const endMinutes = startMinutes + 30

        return {
          time: `${String(Math.floor(startMinutes / 60)).padStart(2, '0')}:${String(
            startMinutes % 60
          ).padStart(2, '0')}`,
          appointments: selectedAppointments.filter((item) => {
            const date = new Date(item.appointmentDate)
            const appointmentMinutes = date.getHours() * 60 + date.getMinutes()

            return appointmentMinutes >= startMinutes && appointmentMinutes < endMinutes
          })
        }
      }),
    [selectedAppointments]
  )

  const outsideScheduleAppointments = selectedAppointments.filter((item) => {
    const date = new Date(item.appointmentDate)
    const minutes = date.getHours() * 60 + date.getMinutes()

    return minutes < SCHEDULE_START_HOUR * 60 || minutes >= SCHEDULE_END_HOUR * 60
  })

  const goToMonth = (direction: number): void => {
    setCurrentMonth(
      (previous) => new Date(previous.getFullYear(), previous.getMonth() + direction, 1)
    )
  }

  const selectDay = (date: Date): void => {
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1))
    onSelectDate(date)
  }

  return (
    <section className="appointment-calendar">
      {/* CALENDAR HEADER */}
      <div className="appointment-calendar-card">
        <div className="appointment-calendar-header">
          <div className="appointment-calendar-heading">
            <div className="appointment-calendar-icon">
              <CalendarDays size={25} />
            </div>

            <div>
              <h3>Calendrier des rendez-vous</h3>

              <p>Consultez votre planning mensuel</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onAddAppointment?.()}
            className="appointment-calendar-add"
          >
            <Plus size={18} />
            Ajouter un rendez-vous
          </button>
        </div>

        <div className="appointment-calendar-content">
          {/* MONTH CALENDAR */}
          <div className="appointment-month-view">
            {/* MONTH NAVIGATION */}
            <div className="appointment-month-navigation">
              <div>
                <h4>
                  {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h4>

                <p>Cliquez sur une journée pour créer un rendez-vous</p>
              </div>

              <div className="appointment-month-controls">
                <button
                  type="button"
                  onClick={() => goToMonth(-1)}
                  aria-label="Mois précédent"
                  className="appointment-month-button"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const now = new Date()
                    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1))
                    onSelectDate(now)
                  }}
                  className="appointment-today-button"
                >
                  Aujourd&apos;hui
                </button>

                <button
                  type="button"
                  onClick={() => goToMonth(1)}
                  aria-label="Mois suivant"
                  className="appointment-month-button"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* DAYS */}
            <div className="appointment-weekdays">
              {DAYS.map((day) => (
                <div key={day} className="appointment-weekday">
                  {day}
                </div>
              ))}
            </div>

            {/* CALENDAR GRID */}
            <div className="appointment-calendar-grid">
              {calendarDays.map((cell, index) => {
                const selected = sameDay(cell.date, selectedDate)
                const isCurrentDay = sameDay(cell.date, today)

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectDay(cell.date)}
                    title={`Afficher le planning du ${cell.date.toLocaleDateString('fr-FR')}`}
                    className={`appointment-day-cell ${
                      !cell.currentMonth ? 'outside-month' : ''
                    } ${selected ? 'selected' : ''}`}
                  >
                    <span
                      className={`appointment-day-number ${
                        isCurrentDay ? 'today' : selected ? 'selected' : ''
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>

                    {cell.appointments.length > 0 && (
                      <div className="appointment-day-indicators">
                        <span className="appointment-day-count">
                          {cell.appointments.length} RDV
                        </span>

                        <div className="appointment-status-dots">
                          {cell.appointments.some((item) => item.status === 'confirmed') && (
                            <span className="confirmed" />
                          )}

                          {cell.appointments.some((item) => item.status === 'cancelled') && (
                            <span className="cancelled" />
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* LEGEND */}
            <div className="appointment-calendar-legend">
              <div>
                <span className="confirmed" />
                Confirmé
              </div>

              <div>
                <span className="cancelled" />
                Annulé
              </div>

              <div>
                <span className="today" />
                Aujourd&apos;hui
              </div>
            </div>
          </div>

          {/* SELECTED DAY */}
          <aside className="appointment-day-panel">
            <div className="appointment-day-panel-header">
              <div>
                <span className="appointment-day-eyebrow">Planning journalier</span>

                <h4>
                  {selectedDate.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </h4>
              </div>

              <div className="appointment-day-panel-icon">
                <CalendarDays size={20} />
              </div>
            </div>

            <div className="appointment-day-timeline" aria-label="Planning horaire de la journée">
              {scheduleSlots.map((slot) => (
                <div className="appointment-time-slot" key={slot.time}>
                  <time className="appointment-time-label">{slot.time}</time>
                  <div className="appointment-time-slot-content">
                    {slot.appointments.map((appointment) => {
                      const status = getStatus(appointment.status)
                      const StatusIcon = status.icon

                      return (
                        <article
                          key={appointment.id}
                          className={`appointment-time-item ${appointment.status}`}
                        >
                          <div className="appointment-time-item-heading">
                            <strong>
                              {appointment.patientFirstName ?? 'Patient'}{' '}
                              {appointment.patientLastName ?? ''}
                            </strong>
                            <span>{formatTime(appointment.appointmentDate)}</span>
                          </div>
                          <p>{appointment.treatment}</p>
                          <div className="appointment-time-item-meta">
                            <span className={`appointment-status ${appointment.status}`}>
                              <StatusIcon size={11} />
                              {status.label}
                            </span>
                          </div>
                          {(paymentsByAppointment.get(appointment.id)?.length ?? 0) > 0 && (
                            <div className="appointment-time-payments">
                              {paymentsByAppointment.get(appointment.id)?.map((payment) => (
                                <div key={payment.id}>
                                  <span>
                                    Payé le{' '}
                                    {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                                  </span>
                                  <strong>
                                    {new Intl.NumberFormat('fr-FR', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    }).format(payment.amountCents / 100)}
                                  </strong>
                                </div>
                              ))}
                            </div>
                          )}
                        </article>
                      )
                    })}
                  </div>
                </div>
              ))}

              <div className="appointment-time-slot appointment-time-end">
                <time className="appointment-time-label">22:00</time>
                <div className="appointment-time-slot-content" />
              </div>

              {outsideScheduleAppointments.length > 0 && (
                <div className="appointment-outside-hours">
                  <h5>Hors plage horaire</h5>
                  {outsideScheduleAppointments.map((appointment) => (
                    <div className="appointment-outside-hours-item" key={appointment.id}>
                      <time>{formatTime(appointment.appointmentDate)}</time>
                      <span>
                        {appointment.patientFirstName ?? 'Patient'}{' '}
                        {appointment.patientLastName ?? ''}
                      </span>
                      <small>{appointment.treatment}</small>
                      {paymentsByAppointment.get(appointment.id)?.map((payment) => (
                        <small key={payment.id}>
                          Payé le {new Date(payment.paymentDate).toLocaleDateString('fr-FR')} —{' '}
                          {new Intl.NumberFormat('fr-FR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(payment.amountCents / 100)}
                        </small>
                      ))}
                    </div>
                  ))}
                </div>
              )}

            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
