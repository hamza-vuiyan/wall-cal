import { useState, useEffect, useRef, useCallback } from 'react'
import type { WishlistItem, DayColor } from '@/services/storage'
import { DAY_COLOR_PALETTE } from '@/services/storage'

interface WishlistEditorModalProps {
  item?: WishlistItem
  onSave: (data: Omit<WishlistItem, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'completedAt'>) => void
  onUpdate?: (id: string, changes: Partial<Omit<WishlistItem, 'id' | 'createdAt'>>) => void
  onClose: () => void
}

export function WishlistEditorModal({ item, onSave, onUpdate, onClose }: WishlistEditorModalProps) {
  const [title, setTitle]         = useState(item?.title ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [color, setColor]         = useState<DayColor | undefined>(item?.color)

  const titleRef = useRef<HTMLInputElement>(null)
  const isEditing = Boolean(item)

  useEffect(() => { titleRef.current?.focus() }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    const trimmedDesc = description.trim()
    if (!trimmedTitle) return

    if (isEditing && item && onUpdate) {
      onUpdate(item.id, {
        title: trimmedTitle,
        description: trimmedDesc,
        color
      })
    } else {
      onSave({
        title: trimmedTitle,
        description: trimmedDesc,
        color
      })
    }
    onClose()
  }, [isEditing, item, title, description, color, onSave, onUpdate, onClose])

  return (
    <>
      <div className="note-modal-backdrop" aria-hidden="true" onClick={onClose} style={{ zIndex: 301 }} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? 'Edit wish' : 'Create wish'}
        className="task-modal"
        style={{ zIndex: 302 }}
      >
        <div className="note-modal-header">
          <div>
            <h2 className="note-modal-date">
              {isEditing ? 'Edit Wish' : 'New Wish'}
            </h2>
            <p className="note-modal-count">Dream big.</p>
          </div>
          <button className="note-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form className="task-form" onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="task-form-field">
            <label className="task-form-label" htmlFor="wish-title">
              Title <span className="task-form-required">*</span>
            </label>
            <input
              id="wish-title"
              ref={titleRef}
              className="task-form-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Run a marathon"
              required
              autoComplete="off"
            />
          </div>

          {/* Description */}
          <div className="task-form-field">
            <label className="task-form-label" htmlFor="wish-desc">
              Description <span className="task-form-optional">(optional)</span>
            </label>
            <textarea
              id="wish-desc"
              className="note-textarea"
              style={{ marginTop: 0 }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add some details..."
              rows={2}
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
              disabled={!title.trim()}
            >
              {isEditing ? 'Save Changes' : 'Create Wish'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
