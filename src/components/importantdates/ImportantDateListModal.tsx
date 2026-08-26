import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import type { ImportantDate } from '@/services/storage'
import { iconEmoji, iconLabel } from '@/utils/importantDateUtils'
import { ImportantDateEditorModal } from './ImportantDateEditorModal'

interface ImportantDateListModalProps {
  dateKey: string
  dateLabel: string
  onClose: () => void
}

export function ImportantDateListModal({
  dateKey,
  dateLabel,
  onClose,
}: ImportantDateListModalProps) {
  const importantDates = useAppStore((s) => s.data.importantDates) ?? []
  const addImportantDate = useAppStore((s) => s.addImportantDate)
  const updateImportantDate = useAppStore((s) => s.updateImportantDate)
  const deleteImportantDate = useAppStore((s) => s.deleteImportantDate)

  const [editing, setEditing] = useState<ImportantDate | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const dayDates = importantDates.filter((d) => d.date === dateKey)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (showAdd) {
    return (
      <ImportantDateEditorModal
        defaultDate={dateKey}
        onSave={(data) => { addImportantDate(data); setShowAdd(false) }}
        onClose={() => setShowAdd(false)}
      />
    )
  }

  if (editing) {
    return (
      <ImportantDateEditorModal
        importantDate={editing}
        onSave={(data) => { updateImportantDate(editing.id, data); setEditing(null) }}
        onClose={() => setEditing(null)}
      />
    )
  }

  return (
    <>
      <div className="note-modal-backdrop" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Important dates for ${dateLabel}`}
        className="task-list-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="note-modal-header">
          <div>
            <h2 className="note-modal-date">{dateLabel}</h2>
            <p className="note-modal-count">
              {dayDates.length === 0
                ? 'No important dates'
                : `${dayDates.length} important date${dayDates.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <button className="note-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <ul className="task-list" aria-label="Important dates">
          {dayDates.length === 0 && (
            <li className="task-list-empty">
              <p>No important dates on this day yet.</p>
            </li>
          )}
          {dayDates.map((imp) => {
            const isConfirming = confirmDeleteId === imp.id
            return (
              <li
                key={imp.id}
                className={`task-list-item${imp.color ? ` task-list-item--color-${imp.color}` : ''}`}
              >
                {isConfirming && (
                  <div className="task-delete-confirm">
                    <span>Delete this date?</span>
                    <button
                      className="note-action-btn note-action-btn--save"
                      onClick={() => { deleteImportantDate(imp.id); setConfirmDeleteId(null) }}
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

                <div className="imp-list-emoji" aria-hidden="true">{iconEmoji(imp.icon)}</div>

                <div className="task-list-content">
                  <span className="task-title">{imp.title}</span>
                  {(imp.category || imp.description) && (
                    <span className="task-subtitle">
                      {[iconLabel(imp.icon), imp.category].filter(Boolean).join(' · ')}
                      {imp.description ? ` — ${imp.description}` : ''}
                    </span>
                  )}
                </div>

                <div className="task-list-actions">
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
              </li>
            )
          })}
        </ul>

        <div className="task-list-footer">
          <button className="note-add-btn" onClick={() => setShowAdd(true)}>
            + Add Important Date
          </button>
        </div>
      </div>
    </>
  )
}
