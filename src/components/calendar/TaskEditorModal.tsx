import { useState, useEffect, useRef, useCallback } from 'react'
import type { Task, DayColor } from '@/services/storage'
import { DAY_COLOR_PALETTE } from '@/services/storage'

interface TaskEditorModalProps {
  dateLabel: string
  /** If provided, we're editing an existing task. Otherwise creating a new one. */
  task?: Task
  /** Default date key — used when creating */
  dateKey: string
  onSave: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  onClose: () => void
}

export function TaskEditorModal({
  dateLabel,
  task,
  dateKey,
  onSave,
  onClose,
}: TaskEditorModalProps) {
  const [title, setTitle]           = useState(task?.title ?? '')
  const [time, setTime]             = useState(task?.time ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [color, setColor]           = useState<DayColor | undefined>(task?.color)
  const [completed, setCompleted]   = useState(task?.completed ?? false)

  const titleRef = useRef<HTMLInputElement>(null)

  const isEditing = Boolean(task)

  // Focus title on open
  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  // Escape closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    onSave({
      title: trimmedTitle,
      date: dateKey,
      time: time.trim() || undefined,
      description: description.trim() || undefined,
      color,
      completed,
    })
    onClose()
  }, [title, time, description, color, completed, dateKey, onSave, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className="note-modal-backdrop"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? `Edit task` : `New task for ${dateLabel}`}
        className="task-modal"
      >
        {/* Header */}
        <div className="note-modal-header">
          <div>
            <h2 className="note-modal-date">
              {isEditing ? 'Edit Task' : `New Task — ${dateLabel}`}
            </h2>
          </div>
          <button
            className="note-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form className="task-form" onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="task-form-field">
            <label className="task-form-label" htmlFor="task-title">
              Title <span className="task-form-required">*</span>
            </label>
            <input
              id="task-title"
              ref={titleRef}
              className="task-form-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Study Networking"
              required
              autoComplete="off"
            />
          </div>

          {/* Time */}
          <div className="task-form-field">
            <label className="task-form-label" htmlFor="task-time">
              Time <span className="task-form-optional">(optional)</span>
            </label>
            <input
              id="task-time"
              className="task-form-input task-form-input--time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="task-form-field">
            <label className="task-form-label" htmlFor="task-desc">
              Description <span className="task-form-optional">(optional)</span>
            </label>
            <textarea
              id="task-desc"
              className="task-form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details…"
              rows={3}
            />
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
              >
                ✕
              </button>
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

          {/* Completed (editing only) */}
          {isEditing && (
            <div className="task-form-field task-form-field--row">
              <label className="task-form-label" htmlFor="task-completed">
                Mark as completed
              </label>
              <button
                id="task-completed"
                type="button"
                role="switch"
                aria-checked={completed}
                className={`task-toggle${completed ? ' task-toggle--on' : ''}`}
                onClick={() => setCompleted((v) => !v)}
              >
                <span className="task-toggle-thumb" />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="task-form-actions">
            <button
              type="button"
              className="note-action-btn note-action-btn--cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="note-add-btn"
              disabled={!title.trim()}
            >
              {isEditing ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
