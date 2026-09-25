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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[302] animate-in fade-in duration-200"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? `Edit task` : `New task for ${dateLabel}`}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[303] w-[92vw] sm:w-[480px] max-h-[90vh] overflow-y-auto bg-[var(--color-surface-raised)] border border-[var(--color-surface-border)] rounded-xl shadow-2xl p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-surface-border)] pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] m-0 tracking-tight font-display">
              {isEditing ? 'Edit Task' : `New Task`}
            </h2>
            <p className="text-sm font-medium text-[var(--color-text-muted)] mt-1">
              {dateLabel}
            </p>
          </div>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-primary)] transition-colors -mr-2"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[var(--color-text-secondary)]" htmlFor="task-title">
              Title <span className="text-[var(--color-destructive)] ml-0.5">*</span>
            </label>
            <input
              id="task-title"
              ref={titleRef}
              className="bg-[var(--color-surface-base)] border border-[var(--color-surface-border)] rounded-lg text-[var(--color-text-primary)] font-sans text-base px-3 py-2 transition-all duration-200 outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-focus-ring)]"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Study Networking"
              required
              autoComplete="off"
            />
          </div>

          {/* Time */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[var(--color-text-secondary)]" htmlFor="task-time">
              Time <span className="font-normal text-[var(--color-text-muted)]">(optional)</span>
            </label>
            <input
              id="task-time"
              className="bg-[var(--color-surface-base)] border border-[var(--color-surface-border)] rounded-lg text-[var(--color-text-primary)] font-sans text-base px-3 py-2 transition-all duration-200 outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-focus-ring)] w-[140px] [color-scheme:dark]"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[var(--color-text-secondary)]" htmlFor="task-desc">
              Description <span className="font-normal text-[var(--color-text-muted)]">(optional)</span>
            </label>
            <textarea
              id="task-desc"
              className="bg-[var(--color-surface-base)] border border-[var(--color-surface-border)] rounded-lg text-[var(--color-text-primary)] font-sans text-base px-3 py-2 transition-all duration-200 outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-focus-ring)] resize-y min-h-[5rem]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details…"
              rows={3}
            />
          </div>

          {/* Color */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
              Color <span className="font-normal text-[var(--color-text-muted)]">(optional)</span>
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all
                  ${!color ? 'border-[var(--color-brand-500)] bg-[var(--color-surface-overlay)] text-[var(--color-brand-500)] ring-2 ring-[var(--color-focus-ring)]' : 'border-[var(--color-surface-border)] bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-text-secondary)]'}`}
                onClick={() => setColor(undefined)}
                aria-label="No color"
                title="No color"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="2" y1="2" x2="12" y2="12" />
                  <line x1="12" y1="2" x2="2" y2="12" />
                </svg>
              </button>
              {DAY_COLOR_PALETTE.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  className={`w-8 h-8 rounded-full transition-all flex items-center justify-center border-2 border-transparent
                    ${color === id ? 'ring-2 ring-[var(--color-focus-ring)] border-white scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: `var(--color-${id}-500)` }}
                  onClick={() => setColor(id)}
                  aria-label={label}
                  title={label}
                />
              ))}
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full overflow-hidden border-2 border-transparent hover:scale-110 transition-all cursor-pointer" title="Custom color">
                <input
                  type="color"
                  className="absolute inset-[-10px] w-12 h-12 opacity-0 cursor-pointer"
                  value={color?.startsWith('#') ? color : '#ffffff'}
                  onChange={(e) => setColor(e.target.value)}
                />
                <div 
                   className="w-full h-full rounded-full pointer-events-none" 
                   style={{ 
                     background: color?.startsWith('#') ? color : 'conic-gradient(red, yellow, green, cyan, blue, magenta, red)',
                     border: color?.startsWith('#') ? '1px solid white' : 'none'
                   }} 
                />
              </div>
            </div>
          </div>

          {/* Completed (editing only) */}
          {isEditing && (
            <div className="flex flex-row items-center justify-between mt-2 py-3 border-t border-[var(--color-surface-border)]">
              <label className="text-sm font-semibold text-[var(--color-text-secondary)] cursor-pointer" htmlFor="task-completed">
                Mark as completed
              </label>
              <button
                id="task-completed"
                type="button"
                role="switch"
                aria-checked={completed}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface-raised)]
                  ${completed ? 'bg-[var(--color-brand-500)]' : 'bg-[var(--color-surface-overlay)] border-[var(--color-surface-border)]'}`}
                onClick={() => setCompleted((v) => !v)}
              >
                <span className="sr-only">Use setting</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${completed ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 mt-2 border-t border-[var(--color-surface-border)]">
            <button
              type="button"
              className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-secondary)] transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-500)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
