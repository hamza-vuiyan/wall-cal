/** Placeholder – settings will be implemented in a future phase. */
export function SettingsPage() {
  return (
    <main id="main-content" className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-surface-raised)] ring-1 ring-[var(--color-surface-border)]">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <circle cx="14" cy="14" r="3.5" stroke="var(--color-brand-400)" strokeWidth="1.8" />
          <path
            d="M14 4v2.5M14 21.5V24M4 14h2.5M21.5 14H24M6.5 6.5l1.8 1.8M19.7 19.7l1.8 1.8M6.5 21.5l1.8-1.8M19.7 8.3l1.8-1.8"
            stroke="var(--color-brand-400)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Settings</h1>
      <p className="max-w-sm text-[var(--color-text-secondary)]">
        Settings configuration is coming in a future phase.
      </p>
    </main>
  )
}
