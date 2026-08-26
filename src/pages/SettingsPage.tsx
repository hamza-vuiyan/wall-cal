import { useRef, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { downloadBackup, parseBackup } from '@/utils/backupUtils'
import type { WallCalBackup } from '@/utils/backupUtils'

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

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingBackup, setPendingBackup] = useState<WallCalBackup | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Settings</h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Manage your account and back up your WallCal data.
          </p>
        </header>

        {/* Account */}
        <section className="mb-6 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Account
          </h2>
          {authStatus === 'authenticated' && user ? (
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? 'User avatar'}
                  className="h-10 w-10 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand-600)] text-[var(--color-brand-100)]">
                  {(user.displayName ?? user.email ?? 'U')[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">
                  {user.displayName ?? user.email ?? 'Signed in'}
                </p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Synced to your cloud account
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[var(--color-text-secondary)]">
              You are using WallCal as a guest. Your data is stored only on this
              device. Sign in from the menu above to sync across devices.
            </p>
          )}
        </section>

        {/* Backup & Restore */}
        <section className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-raised)] p-5">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Backup &amp; Restore
          </h2>
          <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
            Export your full WallCal data to a JSON file, or import a previously
            saved backup.
          </p>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              id="export-json-btn"
              onClick={handleExport}
              className="note-add-btn"
              style={{ padding: '0.5rem 1.1rem' }}
            >
              Export JSON
            </button>
            <button
              id="import-json-btn"
              onClick={handleImportClick}
              className="note-action-btn"
              style={{ padding: '0.5rem 1.1rem' }}
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
        </section>
      </div>

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
      <div className="note-modal-backdrop" aria-hidden="true" onClick={onCancel} />
      <div role="dialog" aria-modal="true" aria-label="Import backup" className="note-modal">
        <div className="note-modal-header">
          <div>
            <h2 className="note-modal-date">Import backup</h2>
            <p className="note-modal-count">Exported {exportedLabel}</p>
          </div>
          <button className="note-modal-close" onClick={onCancel} aria-label="Cancel">
            ×
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-[var(--color-text-secondary)]">
          <SummaryChip label="Days" value={summary.days} />
          <SummaryChip label="Notes" value={summary.notes} />
          <SummaryChip label="Tasks" value={summary.tasks} />
          <SummaryChip label="Dates" value={summary.importantDates} />
          <SummaryChip label="Challenges" value={summary.challenges} />
          <SummaryChip label="Habits" value={summary.habits} />
        </div>

        <p className="text-sm text-[var(--color-text-secondary)]">
          Choose how you'd like to bring in this backup.
        </p>

        <div className="flex flex-col gap-2">
          <button className="note-action-btn note-action-btn--save" onClick={onMerge}>
            Merge with existing data
          </button>
          <button className="note-action-btn note-action-btn--save" onClick={onReplace}>
            Replace everything
          </button>
          <p className="text-xs text-[var(--color-text-muted)]">
            Replace permanently overwrites all your current WallCal data with the
            backup's contents.
          </p>
          <button
            className="note-action-btn note-action-btn--cancel"
            onClick={onCancel}
            style={{ alignSelf: 'flex-start' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}

function SummaryChip({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-full border border-[var(--color-surface-border)] bg-[var(--color-surface-base)] px-2.5 py-1">
      <strong className="text-[var(--color-text-primary)]">{value}</strong>{' '}
      {label}
    </span>
  )
}
