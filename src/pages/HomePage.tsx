import type { AppView } from '@/types'

interface HomePageProps {
  onNavigate: (view: AppView) => void
}

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
        <line x1="3" y1="9" x2="19" y2="9" stroke="currentColor" strokeWidth="1.6" />
        <line x1="7.5" y1="2" x2="7.5" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="14.5" y1="2" x2="14.5" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    title: 'Familiar Layout',
    description: 'The classic month-at-a-glance view you know and love, elevated for your screen.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.6" />
        <polyline points="11,6 11,11 14.5,14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'At a Glance',
    description: 'See your entire month in one view. No clicking through endless menus.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path d="M3 6h16M3 11h10M3 16h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    title: 'Clean & Focused',
    description: 'No noise, no distractions. Just your schedule, beautifully presented.',
  },
]

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      {/* ── Hero ────────────────────────────────────────────── */}
      <section
        aria-labelledby="hero-heading"
        className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24 text-center"
      >
        {/* Ambient background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 0%, oklch(47% 0.26 260 / 0.18) 0%, transparent 70%)',
          }}
        />

        {/* Heading */}
        <h1
          id="hero-heading"
          className="mb-4 max-w-3xl text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)] sm:text-6xl lg:text-7xl flex items-center justify-center gap-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          WallCal
          <span className="text-sm sm:text-base tracking-widest font-sans font-bold uppercase bg-[var(--color-brand-500)] text-[var(--color-accent-contrast)] px-3 py-1 rounded-full align-middle mt-2">
            Beta
          </span>
        </h1>

        {/* Tagline */}
        <p className="mb-10 max-w-xl text-xl font-light text-[var(--color-text-secondary)] sm:text-2xl">
          Your physical calendar,{' '}
          <em className="not-italic text-[var(--color-brand-300)]">reimagined.</em>
        </p>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <button
            id="hero-cta-primary"
            onClick={() => onNavigate('calendar')}
            className="group relative overflow-hidden rounded-xl bg-[var(--color-brand-500)] px-8 py-3.5 text-sm font-semibold text-[var(--color-accent-contrast)] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-brand-400)] hover:shadow-[0_8px_30px_var(--color-brand-500)/40%] active:translate-y-0"
          >
            Open Calendar
          </button>
          <button
            id="hero-cta-secondary"
            onClick={() => onNavigate('settings')}
            className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] px-8 py-3.5 text-sm font-medium text-[var(--color-text-secondary)] transition-all duration-200 hover:border-[var(--color-surface-overlay)] hover:text-[var(--color-text-primary)]"
          >
            Settings
          </button>
        </div>
      </section>

      {/* ── Feature Cards ───────────────────────────────────── */}
      <section
        aria-labelledby="features-heading"
        className="mx-auto w-full max-w-7xl px-6 pb-24"
      >
        <h2 id="features-heading" className="sr-only">
          Features
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="group rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-6 transition-all duration-200 hover:border-[var(--color-brand-700)] hover:bg-[var(--color-surface-overlay)]"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-brand-900)] text-[var(--color-brand-300)] ring-1 ring-[var(--color-brand-800)] transition-colors group-hover:bg-[var(--color-brand-800)] group-hover:text-[var(--color-brand-200)]">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-base font-semibold text-[var(--color-text-primary)]">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
