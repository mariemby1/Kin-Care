import {
  CalendarDays,
  Clock,
  Plus,
  ArrowRight,
  UserPlus,
  CheckCircle2,
  CalendarCheck,
  FileText
} from 'lucide-react'
import { useDashboard } from '../hooks/useDashboard'

const activityIcons = {
  user: UserPlus,
  check: CheckCircle2,
  calendar: CalendarCheck,
  file: FileText
}

function DashboardContent(): React.JSX.Element {
  const {
  formattedTime,
  formattedDate,
  appointments,
  recentActivities,
  loading,
  error
} = useDashboard()
  return (
    <>
      {/* WELCOME SECTION */}
      <div className="welcome-section">
        <div>
          <span className="welcome-label">
            VOTRE ESPACE PROFESSIONNEL
          </span>

          <h2>
            Bonjour, Ameni Ben Youssef 👋
          </h2>

          <p>
            Voici un aperçu de l'activité de votre cabinet.
            <br />
            Prenez soin de vos patients, une étape à la fois.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent('dashboard:navigate', {
                detail: 'appointments'
              })
            )
          }
        >
          <Plus size={19} />
          Nouveau rendez-vous
        </button>
      </div>

      {/* CLOCK SECTION */}
      <section className="clock-card">
        <div className="clock-decoration">
          <Clock size={30} />
        </div>

        <div className="clock-info">
          <span className="clock-label">
            DATE ET HEURE ACTUELLES
          </span>

          <h2>{formattedTime}</h2>
          <p>{formattedDate}</p>
        </div>

        <div className="clock-status">
          <span className="live-dot" />
          Heure en temps réel
        </div>
      </section>

      {/* DASHBOARD GRID */}
      <div className="dashboard-grid">

        {/* APPOINTMENTS */}
        <section className="content-card appointments-card">

          <div className="appointment-summary">
            <div className="summary-icon">
              <CalendarDays size={23} />
            </div>

            <div className="summary-content">
              <span className="summary-label">
                Rendez-vous aujourd'hui
              </span>

              <h2>{appointments.length.toString().padStart(2, '0')}</h2>
            </div>
          </div>

          <div className="card-header">
            <div>
              <h3>Prochains rendez-vous</h3>
              <p>Votre programme de la journée</p>
            </div>

            <button
              className="text-button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent('dashboard:navigate', {
                    detail: 'appointments'
                  })
                )
              }
            >
              Voir tout <ArrowRight size={14} />
            </button>
          </div>

            <div className="appointment-list">

            {loading && <p>Chargement des rendez-vous...</p>}

            {error && <p className="error-message">{error}</p>}

            {!loading && !error && appointments.length === 0 && (
                <p>Aucun rendez-vous aujourd'hui.</p>
            )}

            {!loading && appointments.map((appointment) => (
                <div
                className="appointment-item"
                key={appointment.id}
                >
                <div className="appointment-time">
                    <Clock size={15} />
                    <strong>{appointment.time}</strong>
                </div>

                <div className="appointment-avatar">
                    {appointment.name.charAt(0)}
                </div>

                <div className="appointment-info">
                    <strong>{appointment.name}</strong>
                    <p>{appointment.treatment}</p>
                </div>

                <span
                    className={`status ${
                    appointment.status === 'Confirmé'
                        ? 'confirmed'
                        : 'cancelled'
                    }`}
                >
                    {appointment.status}
                </span>
                </div>
            ))}

            </div>
        </section>

        {/* RECENT ACTIVITIES */}
        <section className="content-card activity-card">

          <div className="card-header">
            <div>
              <h3>Activités récentes</h3>
              <p>Les dernières opérations du cabinet</p>
            </div>

            <span className="activity-count">
              {recentActivities.length}
            </span>
          </div>

          <div className="recent-activity-list">
            {recentActivities.map((activity, index) => {
              const Icon = activityIcons[activity.icon]

              return (
                <div
                  className="recent-activity-item"
                  key={index}
                >
                  <div
                    className={`recent-activity-icon ${activity.color}`}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="recent-activity-info">
                    <strong>{activity.title}</strong>
                    <p>{activity.description}</p>
                    <span>{activity.time}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

      </div>
    </>
  )
}

export default DashboardContent