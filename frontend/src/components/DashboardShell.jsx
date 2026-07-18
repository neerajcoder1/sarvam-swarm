import {
  Bell,
  BookOpen,
  CalendarHeart,
  Check,
  ChevronRight,
  Compass,
  Heart,
  LayoutDashboard,
  Lightbulb,
  Rocket,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const navigation = [
  [LayoutDashboard, 'Overview'],
  [Compass, 'Life strategy'],
  [Heart, 'Wellness intelligence'],
  [BookOpen, 'Daily plan'],
  [Target, 'Goals'],
]

/** Shared shell — 248px sidebar + topbar */
export default function DashboardShell({
  children,
  active,
  setActive,
  notice,
  setNotice,
  onOpenSwarm,
}) {
  return (
    <div className="app-shell">
      <div className="app-layout">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">
              <Sparkles size={17} />
            </div>
            <span>Sarvam Swarm Lite</span>
          </div>
          <div className="brand-subtitle">Agentic AI Life Co-Pilot</div>

          <nav className="nav">
            {navigation.map(([Icon, label]) => (
              <button
                key={label}
                type="button"
                className={active === label ? 'active' : ''}
                onClick={() => setActive(label)}
              >
                <Icon size={17} />
                <span>{label}</span>
              </button>
            ))}
            <button type="button">
              <CalendarHeart size={17} />
              <span>Life calendar</span>
            </button>
            <button type="button">
              <UserRound size={17} />
              <span>Voice assistant</span>
            </button>
            <button type="button" onClick={onOpenSwarm}>
              <Sparkles size={17} />
              <span>AI agents</span>
            </button>
            <button type="button">
              <Settings size={17} />
              <span>Settings</span>
            </button>
          </nav>

          <div className="user-card">
            <div className="user-avatar">PS</div>
            <div>
              <strong>Priya</strong>
              <span>Working professional</span>
              <span>Bangalore, India</span>
            </div>
          </div>

          <div className="pro-card">
            <h4>Autonomous life mode</h4>
            <p>
              Let your AI swarm coordinate wellness, family time, and daily priorities without
              manual planning.
            </p>
            <button type="button" onClick={() => setNotice(true)}>
              Open agent controls
            </button>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div className="crumb">
              Sarvam Swarm Lite{' '}
              <ChevronRight size={12} style={{ verticalAlign: 'middle' }} /> Agentic AI Life
              Co-Pilot
            </div>
            <div className="top-actions">
              <ThemeToggle />
              <button
                type="button"
                className="icon-button"
                onClick={() => setNotice(true)}
                aria-label="Notifications"
              >
                <Bell size={17} />
              </button>
              <div className="profile">
                <div className="avatar">PS</div>
                <span>Priya</span>
              </div>
            </div>
          </header>

          {notice && (
            <div className="notice">
              Agent controls are live. Your life swarm is prioritising the next best action for
              your day.
            </div>
          )}

          {children}

          <footer className="team-footer">
            © 2026 Sarvam Swarm Lite<span>·</span> Personalized Life Agent Swarm
          </footer>
        </main>
      </div>
    </div>
  )
}
