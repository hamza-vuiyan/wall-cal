import { useState, useEffect, useRef, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Note } from '@/services/storage'

// ── Drag handle icon ────────────────────────────────────────────────
function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="4.5" cy="3.5" r="1.1" fill="currentColor" />
      <circle cx="4.5" cy="7"   r="1.1" fill="currentColor" />
      <circle cx="4.5" cy="10.5" r="1.1" fill="currentColor" />
      <circle cx="9.5" cy="3.5" r="1.1" fill="currentColor" />
      <circle cx="9.5" cy="7"   r="1.1" fill="currentColor" />
      <circle cx="9.5" cy="10.5" r="1.1" fill="currentColor" />
    </svg>
  )
}

// ── Single sortable note row ─────────────────────────────────────────
interface SortableNoteProps {
  note: Note
  isEditing: boolean
  editText: string
  editTextareaRef: React.RefObject<HTMLTextAreaElement | null>
  onEditTextChange: (text: string) => void
  onEditKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onCommitEdit: () => void
  onCancelEdit: () => void
  onStartEdit: (note: Note) => void
  onDelete: (noteId: string) => void
}

function SortableNote({
  note,
  isEditing,
  editText,
  editTextareaRef,
  onEditTextChange,
  onEditKeyDown,
  onCommitEdit,
  onCancelEdit,
  onStartEdit,
  onDelete,
}: SortableNoteProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : undefined,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`note-item${isDragging ? ' note-item--dragging' : ''}`}
    >
      {/* Drag handle — only visible in display mode */}
      {!isEditing && (
        <button
          className="note-drag-handle"
          aria-label="Drag to reorder"
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripIcon />
        </button>
      )}

      {isEditing ? (
        /* Edit mode */
        <div className="note-edit-area">
          <textarea
            ref={editTextareaRef}
            className="note-textarea note-textarea--edit"
            value={editText}
            onChange={(e) => onEditTextChange(e.target.value)}
            onKeyDown={onEditKeyDown}
            rows={3}
            aria-label="Edit note"
          />
          <div className="note-edit-actions">
            <button
              className="note-action-btn note-action-btn--save"
              onClick={onCommitEdit}
              disabled={!editText.trim()}
            >
              Save
            </button>
            <button
              className="note-action-btn note-action-btn--cancel"
              onClick={onCancelEdit}
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
              onClick={() => onStartEdit(note)}
              aria-label="Edit note"
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
              onClick={() => onDelete(note.id)}
              aria-label="Delete note"
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
      )}
    </li>
  )
}

// ── Main modal ──────────────────────────────────────────────────────
interface NoteEditorModalProps {
  dateKey: string
  dateLabel: string
  notes: Note[]
  onAdd: (text: string) => void
  onUpdate: (noteId: string, text: string) => void
  onDelete: (noteId: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onClose: () => void
}

export function NoteEditorModal({
  dateKey,
  dateLabel,
  notes,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
  onClose,
}: NoteEditorModalProps) {
  const [newText, setNewText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const newTextareaRef = useRef<HTMLTextAreaElement>(null)
  const editTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus new note textarea when modal opens and there are no notes
  useEffect(() => {
    if (notes.length === 0) {
      newTextareaRef.current?.focus()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Focus edit textarea when entering edit mode
  useEffect(() => {
    if (editingId) {
      editTextareaRef.current?.focus()
      const el = editTextareaRef.current
      if (el) el.setSelectionRange(el.value.length, el.value.length)
    }
  }, [editingId])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (editingId) setEditingId(null)
        else onClose()
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
    if (trimmed) onUpdate(editingId, trimmed)
    setEditingId(null)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      commitEdit()
    }
  }

  // ── DnD setup ───────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // require 5px move before drag starts
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const fromIndex = notes.findIndex((n) => n.id === active.id)
    const toIndex = notes.findIndex((n) => n.id === over.id)
    if (fromIndex !== -1 && toIndex !== -1) {
      onReorder(fromIndex, toIndex)
    }
  }

  const noteIds = notes.map((n) => n.id)

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

        {/* Sortable note list */}
        {notes.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={noteIds} strategy={verticalListSortingStrategy}>
              <ul className="note-list" aria-label="Notes">
                {notes.map((note) => (
                  <SortableNote
                    key={note.id}
                    note={note}
                    isEditing={editingId === note.id}
                    editText={editText}
                    editTextareaRef={editTextareaRef}
                    onEditTextChange={setEditText}
                    onEditKeyDown={handleEditKeyDown}
                    onCommitEdit={commitEdit}
                    onCancelEdit={() => setEditingId(null)}
                    onStartEdit={startEdit}
                    onDelete={onDelete}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
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
