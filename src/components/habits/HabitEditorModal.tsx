import { useState, useEffect, useRef, useCallback } from 'react'
import type { Habit, DayColor, HabitFrequency } from '@/services/storage'
import { DAY_COLOR_PALETTE } from '@/services/storage'

interface HabitEditorModalProps {
  habit?: Habit
  onSave: (data: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'completedDates'>) => void
  onClose: () => void
}

export function HabitEditorModal({ habit, onSave, onClose }: HabitEditorModalProps) {
  const today = new Date().toISOString().slice(0, 10)

  const [name, setName]         = useState(habit?.name ?? '')
  const [color, setColor]       = useState<DayColor | undefined>(habit?.color)
  const [startDate, setStartDate] = useState(habit?.startDate ?? today)
  const [frequency, setFrequency] = useState<HabitFrequency>(habit?.frequency ?? 'daily')

  const nameRef = useRef<HTMLInputElement>(null)
  const isEditing = Boolean(habit)

  useEffect(() => { nameRef.current?.focus() }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || !startDate) return
    onSave({
      name: trimmed,
      color,
      startDate,
      frequency,
    })
    onClose()
  }, [name, color, startDate, frequency, onSave, onClose])

  return (
    <>
      <div className="note-modal-backdrop" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? 'Edit habit' : 'Create habit'}
        className="task-modal"
      >
        <div className="note-modal-header">
          <div>
            <h2 className="note-modal-date">
              {isEditing ? 'Edit Habit' : 'New Habit'}
            </h2>
            <p className="note-modal-count">Track a recurring daily habit</p>
          </div>
          <button className="note-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form className="task-form" onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="task-form-field">
            <label className="task-form-label" htmlFor="habit-name">
              Name <span className="task-form-required">*</span>
            </label>
            <input
              id="habit-name"
              ref={nameRef}
              className="task-form-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Coding, Duolingo, Reading, Exercise"
              required
              autoComplete="off"
            />
          </div>

          {/* Start date */}
          <div className="task-form-field">
            <label className="task-form-label" htmlFor="habit-start">Start Date</label>
            <input
              id="habit-start"
              className="task-form-input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* Frequency */}
          <div className="task-form-field">
            <label className="task-form-label" htmlFor="habit-frequency">Frequency</label>
            <select
              id="habit-frequency"
              className="task-form-input"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
            >
              <option value="daily">Daily (more frequencies coming soon)</option>
            </select>
          </div>

          {/* Color */}
          <div className="task-form-field">
            <span className="task-form-label">
              Color <span className="task-form-optional">(optional)</span>
            </span>
            <div className="task-color-row">
              <button
                type="button"
                className={`task-color-swatch task-color-swatch--none${!color ? ' task-color-swatch--active' : ''}`}
                onClick={() => setColor(undefined)}
                aria-label="No color"
                title="No color"
              >✕</button>
              {DAY_COLOR_PALETTE.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  className={`task-color-swatch task-color-swatch--${id}${color === id ? ' task-color-swatch--active' : ''}`}
                  onClick={() => setColor(id)}
                  aria-label={label}
                  title={label}
                />
              ))}
            </div>
          </div>

          <div className="task-form-actions">
            <button type="button" className="note-action-btn note-action-btn--cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="note-add-btn"
              disabled={!name.trim() || !startDate}
            >
              {isEditing ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
