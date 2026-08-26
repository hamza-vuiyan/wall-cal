import { useState } from 'react'
import type { ImportantDate } from '@/services/storage'
import { iconEmoji, iconLabel, sortImportantDates, isUpcoming } from '@/utils/importantDateUtils'
import { ImportantDateEditorModal } from './ImportantDateEditorModal'

interface ImportantDateManagerModalProps {
  importantDates: ImportantDate[]
  onAdd: (data: Omit<ImportantDate, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdate: (id: string, changes: Partial<Omit<ImportantDate, 'id' | 'createdAt'>>) => void
  onDelete: (id: string) => void
  onClose: () => void
}

function shortLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: y === new Date().getFullYear() ? undefined : 'numeric',
  })
}

export function ImportantDateManagerModal({
  importantDates,
  onAdd,
  onUpdate,
  onDelete,
  onClose,
}: ImportantDateManagerModalProps) {
  const [editing, setEditing] = useState<ImportantDate | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  if (showAdd) {
    return (
      <ImportantDateEditorModal
        onSave={(data) => { onAdd(data); setShowAdd(false) }}
        onClose={() => setShowAdd(false)}
      />
    )
  }

  if (editing) {
    return (
      <ImportantDateEditorModal
        importantDate={editing}
        onSave={(data) => { onUpdate(editing.id, data); setEditing(null) }}
        onClose={() => setEditing(null)}
      />
    )
  }

  const sorted = sortImportantDates(importantDates)
  const upcoming = sorted.filter((d) => isUpcoming(d.date))
  const past = sorted.filter((d) => !isUpcoming(d.date))

  const groups: { key: string; label: string; items: ImportantDate[] }[] = [
    { key: 'upcoming', label: upcoming.length ? `Upcoming (${upcoming.length})` : 'Upcoming', items: upcoming },
    { key: 'past', label: past.length ? `Past (${past.length})` : 'Past', items: past },
  ]

  return (
    <>
      <div className="note-modal-backdrop" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Manage important dates"
        className="task-modal habit-manager-modal"
      >
        <div className="note-modal-header">
          <div>
            <h2 className="note-modal-date">Important Dates</h2>
            <p className="note-modal-count">
              {importantDates.length === 0
                ? 'No important dates yet'
                : `${importantDates.length} important date${importantDates.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className="note-add-btn"
              onClick={() => setShowAdd(true)}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
            >
              + New Date
            </button>
            <button className="note-modal-close" onClick={onClose} aria-label="Close">×</button>
          </div>
        </div>

        <div className="habit-list" aria-label="Important dates">
          {importantDates.length === 0 && (
            <div className="habit-empty">
              <p>No important dates yet.</p>
              <button className="note-add-btn" onClick={() => setShowAdd(true)}>
                + Create your first important date
              </button>
            </div>
          )}

          {groups.map((group) => (
            <section key={group.key} className="imp-group">
              {group.items.length > 0 && (
                <h3 className="imp-group-title">{group.label}</h3>
              )}
              {group.items.map((imp) => {
                const isConfirming = confirmDeleteId === imp.id
                return (
                  <div
                    key={imp.id}
                    className={`habit-card${imp.color ? ` habit-card--${imp.color}` : ''}`}
                  >
                    {isConfirming && (
                      <div className="task-delete-confirm">
                        <span>Delete this date?</span>
                        <button
                          className="note-action-btn note-action-btn--save"
                          onClick={() => { onDelete(imp.id); setConfirmDeleteId(null) }}
                        >
                          Delete
                        </button>
                        <button
                          className="note-action-btn note-action-btn--cancel"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <div className="habit-card-main">
                      <div className="habit-card-title-row">
                        <span className="imp-list-emoji" aria-hidden="true">{iconEmoji(imp.icon)}</span>
                        <div className="imp-card-text">
                          <h3 className="habit-card-name">{imp.title}</h3>
                          <span className="imp-card-meta">
                            {shortLabel(imp.date)}
                            {[iconLabel(imp.icon), imp.category].filter(Boolean).join(' · ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="habit-card-actions">
                      <button
                        className="note-icon-btn"
                        onClick={() => setEditing(imp)}
                        aria-label={`Edit ${imp.title}`}
                        title="Edit"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <path d="M9.5 1.5L12.5 4.5L4.5 12.5H1.5V9.5L9.5 1.5Z"
                            stroke="currentColor" strokeWidth="1.4"
                            strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        className="note-icon-btn note-icon-btn--delete"
                        onClick={() => setConfirmDeleteId(imp.id)}
                        aria-label={`Delete ${imp.title}`}
                        title="Delete"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M6 6.5v4M8 6.5v4M3 4l.8 7.2a.5.5 0 00.5.3h5.4a.5.5 0 00.5-.3L11 4"
                            stroke="currentColor" strokeWidth="1.4"
                            strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
