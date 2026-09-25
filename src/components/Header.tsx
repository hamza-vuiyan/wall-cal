import type { AppView } from '@/types'
import { AuthArea } from '@/components/auth/AuthArea'

interface NavItem {
  id: AppView
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: 'challenges',
    label: 'Challenges',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

interface HeaderProps {
  currentView: AppView
  onNavigate: (view: AppView) => void
}

export function Header({ currentView, onNavigate }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header-inner">

        {/* ── Brand ─────────────────────────────────────────────── */}
        <button
          id="header-logo"
          onClick={() => onNavigate('home')}
          className="app-brand"
          aria-label="Go to WallCal home"
        >
          {/* Calendar + pin icon */}
          <span className="app-brand-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              {/* Calendar body */}
              <rect x="5" y="9" width="22" height="19" rx="3" stroke="currentColor" strokeWidth="2.2" />
              {/* Header bar */}
              <rect x="5" y="9" width="22" height="6" rx="3" fill="currentColor" opacity="0.25" />
              {/* Ring hangers */}
              <line x1="11" y1="6" x2="11" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="21" y1="6" x2="21" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              {/* Grid dots */}
              <circle cx="12" cy="21" r="1.5" fill="currentColor" opacity="0.7" />
              <circle cx="16" cy="21" r="1.5" fill="currentColor" opacity="0.7" />
              <circle cx="20" cy="21" r="1.5" fill="currentColor" opacity="0.7" />
            </svg>
          </span>
          <span className="app-brand-name">
            WallCal
            <span className="app-brand-beta">Beta</span>
          </span>
        </button>

        {/* ── Desktop Nav ────────────────────────────────────────── */}
        <nav aria-label="Main navigation" className="app-desktop-nav">
          <ul className="app-desktop-nav-list">
            {NAV_ITEMS.map((item) => {
              const isActive = currentView === item.id
              return (
                <li key={item.id}>
                  <button
                    id={`nav-${item.id}`}
                    onClick={() => onNavigate(item.id)}
                    className={`app-nav-item ${isActive ? 'app-nav-item--active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="app-nav-item-icon">{item.icon}</span>
                    {item.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* ── Auth ───────────────────────────────────────────────── */}
        <div className="app-header-auth">
          <AuthArea />
        </div>

      </div>
    </header>
  )
}
