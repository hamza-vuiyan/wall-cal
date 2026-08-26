import { useState } from 'react'
import type { Habit } from '@/services/storage'
import { getHabitStats } from '@/utils/habitUtils'
import { HabitEditorModal } from './HabitEditorModal'

interface HabitManagerModalProps {
  habits: Habit[]
  onAdd: (data: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'completedDates'>) => void
  onUpdate: (id: string, changes: Partial<Omit<Habit, 'id' | 'createdAt'>>) => void
  onDelete: (id: string) => void
  onClose: () => void
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="habit-stat">
      <span className="habit-stat-value">{value}</span>
      <span className="habit-stat-label">{label}</span>
    </div>
  )
}

export function HabitManagerModal({
  habits,
  onAdd,
  onUpdate,
  onDelete,
  onClose,
}: HabitManagerModalProps) {
  const [editing, setEditing] = useState<Habit | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  if (showAdd) {
    return (
      <HabitEditorModal
        onSave={onAdd}
        onClose={() => setShowAdd(false)}
      />
    )
  }

  if (editing) {
    return (
      <HabitEditorModal
        habit={editing}
        onSave={(data) => {
          onUpdate(editing.id, { ...data })
          setEditing(null)
        }}
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
        aria-label="Manage habits"
        className="task-modal habit-manager-modal"
      >
        <div className="note-modal-header">
          <div>
            <h2 className="note-modal-date">Habits</h2>
            <p className="note-modal-count">
              {habits.length === 0
                ? 'No habits yet'
                : `${habits.length} habit${habits.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className="note-add-btn"
              onClick={() => setShowAdd(true)}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
            >
              + New Habit
            </button>
            <button className="note-modal-close" onClick={onClose} aria-label="Close">×</button>
          </div>
        </div>

        <div className="habit-list" aria-label="Habits">
          {habits.length === 0 && (
            <div className="habit-empty">
              <p>No habits yet.</p>
              <button className="note-add-btn" onClick={() => setShowAdd(true)}>
                + Create your first habit
              </button>
            </div>
          )}

          {habits.map((habit) => {
            const stats = getHabitStats(habit)
            const isConfirming = confirmDeleteId === habit.id
            return (
              <div
                key={habit.id}
                className={`habit-card${habit.color ? ` habit-card--${habit.color}` : ''}`}
              >
                {isConfirming && (
                  <div className="task-delete-confirm">
                    <span>Delete this habit?</span>
                    <button
                      className="note-action-btn note-action-btn--save"
                      onClick={() => {
                        onDelete(habit.id)
                        setConfirmDeleteId(null)
                      }}
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
                    <span
                      className={`habit-swatch${habit.color ? ` habit-swatch--${habit.color}` : ''}`}
                      aria-hidden="true"
                    />
                    <h3 className="habit-card-name">{habit.name}</h3>
                  </div>
                  <div className="habit-card-stats">
                    <Stat label="Current streak" value={`${stats.currentStreak}d`} />
                    <Stat label="Best streak" value={`${stats.bestStreak}d`} />
                    <Stat label="Total" value={stats.totalCompletions} />
                    <Stat label="This month" value={stats.monthCompletions} />
                  </div>
                </div>

                <div className="habit-card-actions">
                  <button
                    className="note-icon-btn"
                    onClick={() => setEditing(habit)}
                    aria-label={`Edit ${habit.name}`}
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
                    onClick={() => setConfirmDeleteId(habit.id)}
                    aria-label={`Delete ${habit.name}`}
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
        </div>
      </div>
    </>
  )
}
