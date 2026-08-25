import { useState, useEffect, useRef, useCallback } from 'react'
import type { Challenge, DayColor } from '@/services/storage'
import { DAY_COLOR_PALETTE } from '@/services/storage'
import { getDatesInRange } from '@/utils/challengeUtils'

interface ChallengeEditorModalProps {
  challenge?: Challenge
  onSave: (data: Omit<Challenge, 'id' | 'completedDates' | 'createdAt' | 'updatedAt'>) => void
  onClose: () => void
}

export function ChallengeEditorModal({ challenge, onSave, onClose }: ChallengeEditorModalProps) {
  const today = new Date().toISOString().slice(0, 10)

  const [name, setName]               = useState(challenge?.name ?? '')
  const [startDate, setStartDate]     = useState(challenge?.startDate ?? today)
  const [endDate, setEndDate]         = useState(challenge?.endDate ?? today)
  const [color, setColor]             = useState<DayColor | undefined>(challenge?.color)
  const [description, setDescription] = useState(challenge?.description ?? '')

  const nameRef = useRef<HTMLInputElement>(null)
  const isEditing = Boolean(challenge)

  useEffect(() => { nameRef.current?.focus() }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Auto-advance end date when start changes past it
  useEffect(() => {
    if (endDate < startDate) setEndDate(startDate)
  }, [startDate]) // eslint-disable-line react-hooks/exhaustive-deps

  const duration = getDatesInRange(startDate, endDate).length
  const durationLabel = `${duration} day${duration === 1 ? '' : 's'}`

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || endDate < startDate) return
    onSave({ name: trimmed, startDate, endDate, color, description: description.trim() || undefined })
    onClose()
  }, [name, startDate, endDate, color, description, onSave, onClose])

  return (
    <>
      <div className="note-modal-backdrop" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? 'Edit challenge' : 'Create challenge'}
        className="task-modal"
      >
        <div className="note-modal-header">
          <div>
            <h2 className="note-modal-date">
              {isEditing ? 'Edit Challenge' : 'New Challenge'}
            </h2>
            {startDate && endDate && (
              <p className="note-modal-count">{durationLabel}</p>
            )}
          </div>
          <button className="note-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form className="task-form" onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="task-form-field">
            <label className="task-form-label" htmlFor="ch-name">
              Name <span className="task-form-required">*</span>
            </label>
            <input
              id="ch-name"
              ref={nameRef}
              className="task-form-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Duolingo 30-Day Challenge"
              required
              autoComplete="off"
            />
          </div>

          {/* Date range */}
          <div className="challenge-date-row">
            <div className="task-form-field" style={{ flex: 1 }}>
              <label className="task-form-label" htmlFor="ch-start">Start Date</label>
              <input
                id="ch-start"
                className="task-form-input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <span className="challenge-date-arrow">→</span>
            <div className="task-form-field" style={{ flex: 1 }}>
              <label className="task-form-label" htmlFor="ch-end">End Date</label>
              <input
                id="ch-end"
                className="task-form-input"
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          {/* Duration display */}
          <p className="challenge-duration-label">
            Duration: <strong>{durationLabel}</strong>
          </p>

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

          {/* Description */}
          <div className="task-form-field">
            <label className="task-form-label" htmlFor="ch-desc">
              Description <span className="task-form-optional">(optional)</span>
            </label>
            <textarea
              id="ch-desc"
              className="task-form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this challenge about?"
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
              disabled={!name.trim() || endDate < startDate}
            >
              {isEditing ? 'Save Changes' : 'Create Challenge'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
