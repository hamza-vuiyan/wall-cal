/** Placeholder – Phase 2 will build this out into the full calendar view. */
export function CalendarPage() {
  return (
    <main id="main-content" className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-surface-raised)] ring-1 ring-[var(--color-surface-border)]">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <rect x="3" y="5" width="22" height="20" rx="3" stroke="var(--color-brand-400)" strokeWidth="1.8" />
          <line x1="3" y1="12" x2="25" y2="12" stroke="var(--color-brand-400)" strokeWidth="1.8" />
          <line x1="10" y1="2" x2="10" y2="8" stroke="var(--color-brand-400)" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="18" y1="2" x2="18" y2="8" stroke="var(--color-brand-400)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Calendar</h1>
      <p className="max-w-sm text-[var(--color-text-secondary)]">
        The calendar view is coming in Phase 2. Stay tuned.
      </p>
    </main>
  )
}
