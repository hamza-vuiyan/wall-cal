import { useRef, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { downloadBackup, parseBackup } from '@/utils/backupUtils'
import type { WallCalBackup } from '@/utils/backupUtils'
import { createEmptyData } from '@/services/storage'

/** Count the meaningful items in a backup's data envelope for the summary. */
function summarize(backup: WallCalBackup) {
  const { data } = backup
  let notes = 0
  let tasks = 0
  for (const day of Object.values(data.days)) {
    notes += day.notes?.length ?? 0
    tasks += day.tasks?.length ?? 0
  }
  return {
    days: Object.keys(data.days).length,
    notes,
    tasks,
    challenges: data.challenges?.length ?? 0,
    habits: data.habits?.length ?? 0,
    importantDates: data.importantDates?.length ?? 0,
  }
}

export function SettingsPage() {
  const data = useAppStore((s) => s.data)
  const authStatus = useAppStore((s) => s.authStatus)
  const user = useAppStore((s) => s.user)
  const replaceData = useAppStore((s) => s.replaceData)
  const mergeImportedData = useAppStore((s) => s.mergeImportedData)
  const signIn = useAppStore((s) => s.signIn)
  const signOut = useAppStore((s) => s.signOut)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingBackup, setPendingBackup] = useState<WallCalBackup | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resetConfirming, setResetConfirming] = useState(false)

  const handleExport = () => {
    setError(null)
    downloadBackup(data)
  }

  const handleImportClick = () => {
    setError(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    const file = input.files?.[0]
    // Reset so selecting the same file again re-triggers onChange
    input.value = ''
    if (!file) return

    setError(null)
    try {
      const raw = await file.text()
      const backup = parseBackup(raw)
      setPendingBackup(backup)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error.'
      setError(`Could not read this backup file: ${msg}`)
    }
  }

  const closeModal = () => setPendingBackup(null)
  const summary = pendingBackup ? summarize(pendingBackup) : null

  const handleMerge = () => {
    if (pendingBackup) mergeImportedData(pendingBackup.data)
    closeModal()
  }

  const handleReplace = () => {
    if (pendingBackup) replaceData(pendingBackup.data)
    closeModal()
  }

  const handleResetAllData = () => {
    replaceData(createEmptyData())
    setResetConfirming(false)
  }

  return (
    <main id="settings-page" className="flex flex-1 flex-col px-6 pt-12 pb-12 max-w-3xl mx-auto w-full">
      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)] mb-2 tracking-tight font-display">
          Settings.
        </h1>
        <p className="text-xl text-[var(--color-text-secondary)] font-medium">
          Manage your account, appearance, and data.
        </p>
      </header>

      {error && (
        <div role="alert" className="mb-8 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Appearance */}
      <section className="mb-12">
        <h2 className="mb-4 text-sm font-bold tracking-widest text-[var(--color-text-secondary)] uppercase">
          Appearance
        </h2>
        <div className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-6">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Theme</h3>
          <div className="grid grid-cols-3 gap-3">
            {['Dark', 'Light', 'System'].map((mode) => (
              <button
                key={mode}
                className={`py-2.5 px-3 rounded-lg border text-sm font-semibold transition-colors ${
                  mode === 'Dark'
                    ? 'border-[var(--color-brand-500)] bg-[var(--color-surface-overlay)] text-[var(--color-text-primary)] ring-1 ring-[var(--color-brand-500)]'
                    : 'border-[var(--color-surface-border)] text-[var(--color-text-muted)] cursor-not-allowed opacity-50 bg-[var(--color-surface-base)]'
                }`}
                disabled={mode !== 'Dark'}
                title={mode !== 'Dark' ? 'Coming soon' : ''}
              >
                {mode}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-[var(--color-text-muted)] font-medium">
            Additional themes are currently in development.
          </p>
        </div>
      </section>

      {/* Account */}
      <section className="mb-12">
        <h2 className="mb-4 text-sm font-bold tracking-widest text-[var(--color-text-secondary)] uppercase">
          Account
        </h2>
        <div className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-6">
          {authStatus === 'authenticated' && user ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? 'User avatar'}
                    className="h-14 w-14 rounded-full border-2 border-[var(--color-surface-border)] object-cover bg-[var(--color-surface-base)]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-600)] text-white text-xl font-bold border-2 border-[var(--color-surface-border)]">
                    {(user.displayName ?? user.email ?? 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-[var(--color-text-primary)] text-lg tracking-tight">
                    {user.displayName ?? 'Signed in'}
                  </p>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                    {user.email}
                  </p>
                  <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--color-brand-900)] text-[var(--color-brand-300)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-400)]" />
                    Cloud Sync Active
                  </div>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="px-5 py-2.5 bg-[var(--color-surface-base)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-[var(--color-text-primary)] rounded-lg text-sm font-semibold transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <p className="font-bold text-[var(--color-text-primary)] text-lg tracking-tight mb-1">
                  Guest Mode
                </p>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Your data is stored locally. Sign in to enable cloud sync across your devices.
                </p>
              </div>
              <button
                onClick={() => signIn()}
                className="px-5 py-2.5 bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-500)] text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shadow-sm"
              >
                Sign In with Google
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Data */}
      <section className="mb-12">
        <h2 className="mb-4 text-sm font-bold tracking-widest text-[var(--color-text-secondary)] uppercase">
          Data
        </h2>
        <div className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] overflow-hidden">
          <div className="p-6 border-b border-[var(--color-surface-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-1">Export Backup</h3>
              <p className="text-sm font-medium text-[var(--color-text-secondary)] max-w-sm">
                Download a complete copy of all your calendar data, notes, tasks, and challenges.
              </p>
            </div>
            <button
              onClick={handleExport}
              className="px-5 py-2.5 bg-[var(--color-surface-base)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-[var(--color-text-primary)] rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Export JSON
            </button>
          </div>
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-1">Import Backup</h3>
              <p className="text-sm font-medium text-[var(--color-text-secondary)] max-w-sm">
                Restore data from a previously exported WallCal backup file.
              </p>
            </div>
            <button
              onClick={handleImportClick}
              className="px-5 py-2.5 bg-[var(--color-surface-base)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-[var(--color-text-primary)] rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="mb-16">
        <h2 className="mb-4 text-sm font-bold tracking-widest text-red-500/80 uppercase">
          Danger Zone
        </h2>
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-red-400 mb-1">Reset WallCal</h3>
              <p className="text-sm font-medium text-[var(--color-text-secondary)] max-w-sm">
                Permanently delete all your local data and cloud data (if synced). This cannot be undone.
              </p>
            </div>
            {!resetConfirming ? (
              <button
                onClick={() => setResetConfirming(true)}
                className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
              >
                Reset All Data
              </button>
            ) : null}
          </div>
          
          {resetConfirming && (
            <div className="mt-5 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <span className="text-sm font-bold text-red-400">Are you absolutely sure?</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setResetConfirming(false)}
                  className="px-4 py-2 bg-[var(--color-surface-base)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] border border-[var(--color-surface-border)] rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetAllData}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
                >
                  Yes, delete everything
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section className="text-center pb-8">
        <p className="text-[var(--color-text-primary)] font-bold font-display text-2xl tracking-tight">WallCal</p>
        <p className="text-[var(--color-text-muted)] text-sm font-medium mt-1">Version 1.0.0</p>
      </section>

      {/* Import choice modal */}
      {pendingBackup && summary && (
        <ImportChoiceModal
          summary={summary}
          exportedAt={pendingBackup.exportedAt}
          onMerge={handleMerge}
          onReplace={handleReplace}
          onCancel={closeModal}
        />
      )}
    </main>
  )
}

interface ImportChoiceModalProps {
  summary: ReturnType<typeof summarize>
  exportedAt: string
  onMerge: () => void
  onReplace: () => void
  onCancel: () => void
}

function ImportChoiceModal({
  summary,
  exportedAt,
  onMerge,
  onReplace,
  onCancel,
}: ImportChoiceModalProps) {
  const exportedLabel = new Date(exportedAt).toLocaleString()
  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] animate-in fade-in duration-200" aria-hidden="true" onClick={onCancel} />
      <div role="dialog" aria-modal="true" aria-label="Import backup" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[301] w-[90vw] sm:w-[480px] bg-[var(--color-surface-raised)] border border-[var(--color-surface-border)] rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Import Backup</h2>
            <p className="text-sm font-medium text-[var(--color-text-muted)] mt-1">Exported {exportedLabel}</p>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-primary)] transition-colors" onClick={onCancel} aria-label="Cancel">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-[var(--color-text-secondary)] mb-6">
          <SummaryChip label="Days" value={summary.days} />
          <SummaryChip label="Notes" value={summary.notes} />
          <SummaryChip label="Tasks" value={summary.tasks} />
          <SummaryChip label="Dates" value={summary.importantDates} />
          <SummaryChip label="Challenges" value={summary.challenges} />
          <SummaryChip label="Habits" value={summary.habits} />
        </div>

        <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-4">
          Choose how you'd like to bring in this backup:
        </p>

        <div className="flex flex-col gap-3">
          <button className="w-full px-4 py-3 bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-500)] text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center" onClick={onMerge}>
            Merge with existing data
          </button>
          
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 flex flex-col gap-3 mt-2">
            <button className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-bold transition-colors" onClick={onReplace}>
              Replace everything
            </button>
            <p className="text-xs font-medium text-red-400/80 text-center">
              This permanently overwrites all current data.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

function SummaryChip({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-md border border-[var(--color-surface-border)] bg-[var(--color-surface-overlay)] px-3 py-1.5 text-xs font-semibold">
      <strong className="text-[var(--color-text-primary)] mr-1">{value}</strong>
      {label}
    </span>
  )
}
