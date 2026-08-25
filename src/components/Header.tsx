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
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
        {/* Logo */}
        <button
          id="header-logo"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          aria-label="Go to WallCal home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand-500)]">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <rect x="2" y="3" width="14" height="13" rx="2" stroke="white" strokeWidth="1.5" />
              <line x1="2" y1="7" x2="16" y2="7" stroke="white" strokeWidth="1.5" />
              <line x1="6" y1="1" x2="6" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="12" y1="1" x2="12" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="5" y="10" width="2" height="2" rx="0.5" fill="white" />
              <rect x="9" y="10" width="2" height="2" rx="0.5" fill="white" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)] flex items-center gap-2">
            WallCal
            <span className="text-[0.65rem] tracking-wider font-bold uppercase bg-[var(--color-brand-500)] text-white px-2 py-0.5 rounded-md">
              Beta
            </span>
          </span>
        </button>

        {/* Nav */}
        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  id={`nav-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  className={[
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150',
                    currentView === item.id
                      ? 'bg-[var(--color-surface-overlay)] text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)]',
                  ].join(' ')}
                  aria-current={currentView === item.id ? 'page' : undefined}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Push auth to the far right */}
        <div className="ml-auto">
          <AuthArea />
        </div>
      </div>
    </header>
  )
}
