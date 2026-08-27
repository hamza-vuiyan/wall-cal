import type { AppView } from '@/types'
import { AuthArea } from '@/components/auth/AuthArea'

interface NavItem {
  id: AppView
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'challenges', label: 'Challenges' },
  { id: 'settings', label: 'Settings' },
]

interface HeaderProps {
  currentView: AppView
  onNavigate: (view: AppView) => void
}

export function Header({ currentView, onNavigate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-base)]/80 backdrop-blur-md">
      <div className="mx-auto flex w-full items-center justify-between px-6 py-5 relative">
        {/* Logo */}
        <button
          id="header-logo"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 transition-opacity hover:opacity-80 group z-10"
          aria-label="Go to WallCal home"
        >
          {/* Wall-pin + Calendar Stylized Icon */}
          <div className="relative flex h-8 w-8 items-center justify-center text-[var(--color-accent)]">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="group-hover:scale-105 transition-transform duration-200">
              {/* Calendar Page Outline */}
              <rect x="6" y="8" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="2.5" />
              {/* Horizontal Grid Line */}
              <line x1="6" y1="16" x2="26" y2="16" stroke="currentColor" strokeWidth="2" strokeOpacity="0.5" />
              {/* Vertical Grid Line */}
              <line x1="16" y1="16" x2="16" y2="28" stroke="currentColor" strokeWidth="2" strokeOpacity="0.5" />
              {/* Wall Pin */}
              <circle cx="16" cy="4" r="3" fill="currentColor" />
              <line x1="16" y1="7" x2="16" y2="10" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
            WallCal
            <span className="text-[0.65rem] tracking-wider font-bold uppercase bg-[var(--color-accent-soft)] text-[var(--color-accent)] px-2 py-0.5 rounded-md border border-[var(--color-accent)]/20">
              Beta
            </span>
          </span>
        </button>

        {/* Nav (Desktop Only) */}
        <nav aria-label="Main navigation" className="hidden md:block absolute left-1/2 -translate-x-1/2">
          <ul className="flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const isActive = currentView === item.id
              return (
                <li key={item.id}>
                  <button
                    id={`nav-${item.id}`}
                    onClick={() => onNavigate(item.id)}
                    className={`nav-link py-1.5 text-[0.9375rem] transition-colors duration-150 ${
                      isActive
                        ? 'nav-link--active font-semibold text-[var(--color-text-primary)]'
                        : 'font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Push auth to the far right */}
        <div className="ml-auto z-10 flex items-center">
          <AuthArea />
        </div>
      </div>
    </header>
  )
}
