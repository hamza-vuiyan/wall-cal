import { useState, useEffect, useRef, useCallback } from 'react'
import type { ImportantDate, DayColor, ImportantDateIcon } from '@/services/storage'
import { DAY_COLOR_PALETTE } from '@/services/storage'
import { IMPORTANT_DATE_ICONS, iconEmoji } from '@/utils/importantDateUtils'

interface ImportantDateEditorModalProps {
  importantDate?: ImportantDate
  /** Pre-fill the date (e.g. when opened from a specific day cell) */
  defaultDate?: string
  onSave: (data: Omit<ImportantDate, 'id' | 'createdAt' | 'updatedAt'>) => void
  onClose: () => void
}

export function ImportantDateEditorModal({
  importantDate,
  defaultDate,
  onSave,
  onClose,
}: ImportantDateEditorModalProps) {
  const today = new Date().toISOString().slice(0, 10)

  const [title, setTitle]             = useState(importantDate?.title ?? '')
  const [date, setDate]               = useState(importantDate?.date ?? defaultDate ?? today)
  const [time, setTime]               = useState(importantDate?.time ?? '')
  const [description, setDescription] = useState(importantDate?.description ?? '')
  const [color, setColor]           = useState<DayColor | undefined>(importantDate?.color)
  const [icon, setIcon]             = useState<ImportantDateIcon | undefined>(importantDate?.icon)
  const [category, setCategory]     = useState(importantDate?.category ?? '')

  const titleRef = useRef<HTMLInputElement>(null)
  const isEditing = Boolean(importantDate)

  useEffect(() => { titleRef.current?.focus() }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || !date) return
    onSave({
      title: trimmed,
      date,
      time: time || undefined,
      description: description.trim() || undefined,
      color,
      icon,
      category: category.trim() || undefined,
    })
    onClose()
  }, [title, date, time, description, color, icon, category, onSave, onClose])

  return (
    <>
      <div className="note-modal-backdrop" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? 'Edit important date' : 'Create important date'}
        className="task-modal"
      >
        <div className="note-modal-header">
          <div>
            <h2 className="note-modal-date">
              {isEditing ? 'Edit Important Date' : 'New Important Date'}
            </h2>
            <p className="note-modal-count">
              {icon ? `${iconEmoji(icon)} ${icon}` : 'Birthday, exam, deadline…'}
            </p>
          </div>
          <button className="note-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form className="task-form" onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="task-form-field">
            <label className="task-form-label" htmlFor="imp-title">
              Title <span className="task-form-required">*</span>
            </label>
            <input
              id="imp-title"
              ref={titleRef}
              className="task-form-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mom's birthday, Final exam, Visa deadline"
              required
              autoComplete="off"
            />
          </div>

          <div className="task-form-field">
            <label className="task-form-label" htmlFor="imp-date">Date</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="imp-date"
                className="task-form-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ colorScheme: 'dark', flex: 1 }}
              />
              <input
                id="imp-time"
                className="task-form-input"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{ colorScheme: 'dark', flex: 1 }}
                aria-label="Time (optional)"
              />
            </div>
          </div>

          {/* Icon */}
          <div className="task-form-field">
            <span className="task-form-label">
              Icon <span className="task-form-optional">(optional)</span>
            </span>
            <div className="imp-icon-row">
              <button
                type="button"
                className={`imp-icon-swatch${!icon ? ' imp-icon-swatch--active' : ''}`}
                onClick={() => setIcon(undefined)}
                aria-label="No icon"
                title="No icon"
              >✕</button>
              {IMPORTANT_DATE_ICONS.map(({ id, label, emoji }) => (
                <button
                  key={id}
                  type="button"
                  className={`imp-icon-swatch${icon === id ? ' imp-icon-swatch--active' : ''}`}
                  onClick={() => setIcon(id)}
                  aria-label={label}
                  title={label}
                >{emoji}</button>
              ))}
            </div>
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

          {/* Category */}
          <div className="task-form-field">
            <label className="task-form-label" htmlFor="imp-category">
              Category <span className="task-form-optional">(optional, free text)</span>
            </label>
            <input
              id="imp-category"
              className="task-form-input"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Personal, Work, School"
              autoComplete="off"
            />
          </div>

          {/* Description */}
          <div className="task-form-field">
            <label className="task-form-label" htmlFor="imp-desc">
              Description <span className="task-form-optional">(optional)</span>
            </label>
            <textarea
              id="imp-desc"
              className="task-form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Anything worth remembering about this date?"
              rows={3}
            />
          </div>

          <div className="task-form-actions">
            <button type="button" className="note-action-btn note-action-btn--cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="note-add-btn"
              disabled={!title.trim() || !date}
            >
              {isEditing ? 'Save Changes' : 'Create Important Date'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
