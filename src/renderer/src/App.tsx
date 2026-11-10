import { useEffect, useState } from 'react'
import platformLogo from './assets/platform-logo.png'
import PatientsPage from './features/patients/PatientsPage'
import DashboardPage from './features/dashboard/DashboardPage'
import AppointmentsPage from './features/appointments/AppointmentsPage'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  Activity,
  Receipt,
  Settings,
  Bell,
  Search,
  Menu,
  Stethoscope
} from 'lucide-react'

type Page =
  | 'dashboard'
  | 'patients'
  | 'appointments'
  | 'consultations'
  | 'treatments'
  | 'invoices'
  | 'settings'

const navigation = [
  { id: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'appointments', label: 'Rendez-vous', icon: CalendarDays },
  { id: 'consultations', label: 'Consultations', icon: ClipboardList },
  { id: 'treatments', label: 'Traitements', icon: Activity },
  { id: 'invoices', label: 'Facturation', icon: Receipt }
] as const

function App(): React.JSX.Element {
  const [activePage, setActivePage] = useState<Page>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const handleDashboardNavigation = (event: Event): void => {
      const page = (event as CustomEvent<Page>).detail

      if (page === 'appointments') {
        setActivePage(page)
      }
    }

    window.addEventListener('dashboard:navigate', handleDashboardNavigation)

    return () => {
      window.removeEventListener('dashboard:navigate', handleDashboardNavigation)
    }
  }, [])

  const activeLabel =
    navigation.find((item) => item.id === activePage)?.label ??
    'Paramètres'

  return (
    <div className="app-container">

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>

        <div className="brand">
          <img className="brand-logo" src={platformLogo} alt="Logo Ameni Ben Youssef" />

          {sidebarOpen && (
            <div className="brand-text">
              <h2>
                Kiné<span>Care</span>
              </h2>
              <p>Gestion de cabinet</p>
            </div>
          )}
        </div>

        <div className="sidebar-section">
          {sidebarOpen && (
            <p className="section-label">MENU PRINCIPAL</p>
          )}

          <nav className="navigation">
            {navigation.map((item) => {
              const Icon = item.icon

              return (
                <button
                  key={item.id}
                  className={`nav-item ${
                    activePage === item.id ? 'active' : ''
                  }`}
                  onClick={() => setActivePage(item.id)}
                  title={item.label}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <button
            className={`nav-item ${
              activePage === 'settings' ? 'active' : ''
            }`}
            onClick={() => setActivePage('settings')}
            title="Paramètres"
          >
            <Settings size={20} />
            {sidebarOpen && <span>Paramètres</span>}
          </button>

          {sidebarOpen && (
            <div className="sidebar-profile">
              <div className="avatar">A</div>

              <div>
                <strong>Ameni Ben Youssef</strong>
                <p>Espace professionnel</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* HEADER */}
        <header className="topbar">

          <div className="header-left">
            <button
              className="icon-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Afficher ou masquer le menu"
            >
              <Menu size={21} />
            </button>

            <div>
              <h1>{activeLabel}</h1>
              <p>Bienvenue dans votre espace de gestion</p>
            </div>
          </div>

          <div className="header-right">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Rechercher..."
              />
              <kbd>Ctrl K</kbd>
            </div>

            <button
              className="icon-button notification-button"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="notification-dot" />
            </button>

            <div className="header-avatar">A</div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="page-content">
  {activePage === 'dashboard' ? (
    <DashboardPage />
  ) : activePage === 'patients' ? (
    <PatientsPage />
  ) : activePage === 'appointments' ? (
    <AppointmentsPage />
  ) : (
    <section className="content-card placeholder-page">
      <div className="placeholder-icon">
        <Stethoscope size={28} />
      </div>
      <h2>{activeLabel}</h2>
      <p>
        Cette section sera développée dans les prochaines étapes.
      </p>
    </section>
  )}
</div>
      </main>
    </div>
  )
}

export default App