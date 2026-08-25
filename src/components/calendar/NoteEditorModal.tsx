import { useState, useEffect, useRef, useCallback } from 'react'
import type { Note } from '@/services/storage'

interface NoteEditorModalProps {
  dateKey: string         // "YYYY-MM-DD"
  dateLabel: string       // e.g. "August 25, 2026"
  notes: Note[]
  onAdd: (text: string) => void
  onUpdate: (noteId: string, text: string) => void
  onDelete: (noteId: string) => void
  onClose: () => void
}

/**
 * Full-screen modal for CRUD operations on a day's notes.
 * Opens when the user clicks the note area of a day cell.
 */
export function NoteEditorModal({
  dateKey,
  dateLabel,
  notes,
  onAdd,
  onUpdate,
  onDelete,
  onClose,
}: NoteEditorModalProps) {
  const [newText, setNewText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const newTextareaRef = useRef<HTMLTextAreaElement>(null)
  const editTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus new note textarea when modal opens
  useEffect(() => {
    if (notes.length === 0) {
      newTextareaRef.current?.focus()
    }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  // Focus edit textarea when entering edit mode
  useEffect(() => {
    if (editingId) {
      editTextareaRef.current?.focus()
      // Place cursor at end
      const el = editTextareaRef.current
      if (el) el.setSelectionRange(el.value.length, el.value.length)
    }
  }, [editingId])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (editingId) {
          setEditingId(null)
        } else {
          onClose()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [editingId, onClose])

  const handleAddNote = useCallback(() => {
    const trimmed = newText.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setNewText('')
    newTextareaRef.current?.focus()
  }, [newText, onAdd])

  const handleNewKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl + Enter to submit
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleAddNote()
    }
  }

  const startEdit = (note: Note) => {
    setEditingId(note.id)
    setEditText(note.text)
  }

  const commitEdit = () => {
    if (!editingId) return
    const trimmed = editText.trim()
    if (trimmed) {
      onUpdate(editingId, trimmed)
    }
    setEditingId(null)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      commitEdit()
    }
  }

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
        aria-label={`Notes for ${dateLabel}`}
        className="note-modal"
      >
        {/* Header */}
        <div className="note-modal-header">
          <div>
            <h2 className="note-modal-date">{dateLabel}</h2>
            <p className="note-modal-count">
              {notes.length === 0
                ? 'No notes yet'
                : `${notes.length} note${notes.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            className="note-modal-close"
            onClick={onClose}
            aria-label="Close notes"
          >
            ×
          </button>
        </div>

        {/* Existing notes */}
        {notes.length > 0 && (
          <ul className="note-list" aria-label="Notes">
            {notes.map((note) => (
              <li key={note.id} className="note-item">
                {editingId === note.id ? (
                  /* Edit mode */
                  <div className="note-edit-area">
                    <textarea
                      ref={editTextareaRef}
                      className="note-textarea note-textarea--edit"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      rows={3}
                      aria-label="Edit note"
                    />
                    <div className="note-edit-actions">
                      <button
                        className="note-action-btn note-action-btn--save"
                        onClick={commitEdit}
                        disabled={!editText.trim()}
                      >
                        Save
                      </button>
                      <button
                        className="note-action-btn note-action-btn--cancel"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display mode */
                  <div className="note-display">
                    <p className="note-text">{note.text}</p>
                    <div className="note-item-actions">
                      <button
                        className="note-icon-btn"
                        onClick={() => startEdit(note)}
                        aria-label="Edit note"
                        title="Edit"
                      >
                        {/* Pencil icon */}
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <path d="M9.5 1.5L12.5 4.5L4.5 12.5H1.5V9.5L9.5 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        className="note-icon-btn note-icon-btn--delete"
                        onClick={() => onDelete(note.id)}
                        aria-label="Delete note"
                        title="Delete"
                      >
                        {/* Trash icon */}
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M6 6.5v4M8 6.5v4M3 4l.8 7.2a.5.5 0 00.5.3h5.4a.5.5 0 00.5-.3L11 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* New note input */}
        <div className="note-new-area">
          <textarea
            ref={newTextareaRef}
            id={`note-input-${dateKey}`}
            className="note-textarea note-textarea--new"
            placeholder="Write a note… (⌘↵ to save)"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={handleNewKeyDown}
            rows={3}
            aria-label="New note"
          />
          <button
            className="note-add-btn"
            onClick={handleAddNote}
            disabled={!newText.trim()}
            aria-label="Add note"
          >
            Add note
          </button>
        </div>
      </div>
    </>
  )
}
