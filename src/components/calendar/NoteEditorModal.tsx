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
import type { Note, DayColor } from '@/services/storage'
import { DAY_COLOR_PALETTE } from '@/services/storage'

/** Hard-coded color map so Tailwind JIT doesn't need to generate dynamic classes */
const PALETTE_COLORS: Record<string, string> = {
  yellow: 'oklch(85% 0.20 95)',
  orange: 'oklch(75% 0.20 55)',
  red:    'oklch(65% 0.20 20)',
  pink:   'oklch(72% 0.18 345)',
  purple: 'oklch(68% 0.16 300)',
  blue:   'oklch(68% 0.15 250)',
  cyan:   'oklch(70% 0.15 200)',
  green:  'oklch(68% 0.17 145)',
}

/** Resolves a palette name or custom hex to a CSS color string */
function resolveColor(color: DayColor | undefined): string | undefined {
  if (!color) return undefined
  if (color.startsWith('#')) return color
  return PALETTE_COLORS[color]
}

// ── Grip Icon ──────────────────────────────────────────────────────
function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="4.5" cy="3.5"  r="1.1" fill="currentColor" />
      <circle cx="4.5" cy="7"    r="1.1" fill="currentColor" />
      <circle cx="4.5" cy="10.5" r="1.1" fill="currentColor" />
      <circle cx="9.5" cy="3.5"  r="1.1" fill="currentColor" />
      <circle cx="9.5" cy="7"    r="1.1" fill="currentColor" />
      <circle cx="9.5" cy="10.5" r="1.1" fill="currentColor" />
    </svg>
  )
}

// ── Color picker row (reused in edit + new note) ───────────────────
function ColorPickerRow({
  selectedColor,
  onChange,
}: {
  selectedColor: DayColor | undefined
  onChange: (color: DayColor | undefined) => void
}) {
  return (
    <div className="flex gap-1.5 flex-wrap items-center">
      {/* Clear */}
      <button
        type="button"
        className={
          'w-6 h-6 rounded-full border flex items-center justify-center transition-all ' +
          (!selectedColor
            ? 'border-[var(--color-brand-500)] bg-[var(--color-surface-overlay)] ring-1 ring-[var(--color-brand-500)]'
            : 'border-transparent hover:bg-[var(--color-surface-overlay)] text-[var(--color-text-muted)]')
        }
        onClick={() => onChange(undefined)}
        title="No color"
      >
        <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="2" y1="2" x2="12" y2="12" />
          <line x1="12" y1="2" x2="2" y2="12" />
        </svg>
      </button>

      {/* Palette swatches */}
      {DAY_COLOR_PALETTE.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={
            'w-6 h-6 rounded-full transition-all border-2 border-transparent ' +
            (selectedColor === id ? 'ring-2 ring-[var(--color-focus-ring)] border-white scale-110' : 'hover:scale-110')
          }
          style={{ backgroundColor: PALETTE_COLORS[id] }}
          onClick={() => onChange(id)}
          title={label}
        />
      ))}

      {/* Custom color wheel */}
      <div
        className="relative flex items-center justify-center w-6 h-6 rounded-full overflow-hidden border-2 border-transparent hover:scale-110 transition-all cursor-pointer"
        title="Custom color"
      >
        <input
          type="color"
          className="absolute inset-[-10px] w-10 h-10 opacity-0 cursor-pointer"
          value={selectedColor?.startsWith('#') ? selectedColor : '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
        />
        <div
          className="w-full h-full rounded-full pointer-events-none"
          style={{
            background: selectedColor?.startsWith('#')
              ? selectedColor
              : 'conic-gradient(red, yellow, green, cyan, blue, magenta, red)',
            border: selectedColor?.startsWith('#') ? '1px solid white' : 'none',
          }}
        />
      </div>
    </div>
  )
}

// ── Note display row (with local confirm-delete state) ─────────────
function NoteDisplayRow({
  note,
  onStartEdit,
  onDelete,
}: {
  note: Note
  onStartEdit: (note: Note) => void
  onDelete: (noteId: string) => void
}) {
  const [confirming, setConfirming] = useState(false)
  const resolvedColor = resolveColor(note.color)

  if (confirming) {
    return (
      <div className="flex flex-1 items-center justify-between gap-3 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">Delete this note?</span>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 text-xs font-semibold bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            onClick={() => onDelete(note.id)}
          >
            Delete
          </button>
          <button
            className="px-3 py-1 text-xs font-medium border border-[var(--color-surface-border)] text-[var(--color-text-secondary)] rounded hover:bg-[var(--color-surface-overlay)] transition-colors"
            onClick={() => setConfirming(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 p-3 flex-1 pl-0">
      <div className="flex-1 min-w-0">
        <p
          className="text-lg font-handwriting leading-relaxed m-0 whitespace-pre-wrap break-words"
          style={{ color: resolvedColor ?? 'var(--color-text-secondary)' }}
        >
          {note.text}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          className="w-7 h-7 flex items-center justify-center rounded text-[var(--color-text-muted)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-primary)] transition-colors"
          onClick={() => onStartEdit(note)}
          title="Edit"
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9.5 1.5L12.5 4.5L4.5 12.5H1.5V9.5L9.5 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          className="w-7 h-7 flex items-center justify-center rounded text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
          onClick={() => setConfirming(true)}
          title="Delete"
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M6 6.5v4M8 6.5v4M3 4l.8 7.2a.5.5 0 00.5.3h5.4a.5.5 0 00.5-.3L11 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ── Sortable note item ─────────────────────────────────────────────
interface SortableNoteProps {
  note: Note
  isEditing: boolean
  editText: string
  editTextareaRef: React.RefObject<HTMLTextAreaElement | null>
  onEditTextChange: (text: string) => void
  editColor: DayColor | undefined
  onEditColorChange: (color: DayColor | undefined) => void
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
  editColor,
  onEditColorChange,
  onEditKeyDown,
  onCommitEdit,
  onCancelEdit,
  onStartEdit,
  onDelete,
}: SortableNoteProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: note.id })

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : undefined,
  }

  return (
    <li
      ref={setNodeRef}
      style={dragStyle}
      className={
        'relative rounded-xl border flex items-stretch transition-all duration-200 group ' +
        (isDragging
          ? 'border-[var(--color-brand-500)] shadow-lg bg-[var(--color-surface-overlay)] scale-[1.02]'
          : 'border-transparent hover:border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)]')
      }
    >
      {/* Drag handle – only in display mode */}
      {!isEditing && (
        <button
          className="w-8 flex-shrink-0 flex items-center justify-center text-[var(--color-text-muted)] cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 hover:text-[var(--color-text-secondary)] transition-opacity"
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
        <div className="flex flex-col gap-3 p-3 flex-1">
          <textarea
            ref={editTextareaRef}
            className="w-full bg-transparent border border-[var(--color-surface-border)] rounded-lg text-lg font-handwriting leading-relaxed px-3 py-2 resize-y outline-none focus:border-[var(--color-brand-400)] focus:ring-1 focus:ring-[var(--color-brand-400)] min-h-[5rem] transition-colors"
            style={{ color: resolveColor(editColor) ?? 'var(--color-text-primary)' }}
            value={editText}
            onChange={(e) => onEditTextChange(e.target.value)}
            onKeyDown={onEditKeyDown}
            rows={3}
            aria-label="Edit note"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ColorPickerRow selectedColor={editColor} onChange={onEditColorChange} />
            <div className="flex gap-2">
              <button
                className="px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-primary)] rounded transition-colors"
                onClick={onCancelEdit}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1.5 text-xs font-semibold bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-500)] rounded transition-colors disabled:opacity-50"
                onClick={onCommitEdit}
                disabled={!editText.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Display mode – handles its own confirm-delete */
        <NoteDisplayRow note={note} onStartEdit={onStartEdit} onDelete={onDelete} />
      )}
    </li>
  )
}

// ── Main modal ─────────────────────────────────────────────────────
interface NoteEditorModalProps {
  dateKey: string
  dateLabel: string
  notes: Note[]
  onAdd: (text: string, color?: DayColor) => void
  onUpdate: (noteId: string, text: string, color?: DayColor) => void
  onDelete: (noteId: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onClose: () => void
}

export function NoteEditorModal({
  dateLabel,
  notes,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
  onClose,
}: NoteEditorModalProps) {
  const [newText, setNewText]     = useState('')
  const [newColor, setNewColor]   = useState<DayColor | undefined>(undefined)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText]   = useState('')
  const [editColor, setEditColor] = useState<DayColor | undefined>(undefined)
  const newTextareaRef  = useRef<HTMLTextAreaElement>(null)
  const editTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus new-note textarea when modal opens with no notes
  useEffect(() => {
    if (notes.length === 0) newTextareaRef.current?.focus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Focus edit textarea when entering edit mode
  useEffect(() => {
    if (editingId) {
      editTextareaRef.current?.focus()
      const el = editTextareaRef.current
      if (el) el.setSelectionRange(el.value.length, el.value.length)
    }
  }, [editingId])

  // Escape key handling
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
    onAdd(trimmed, newColor)
    setNewText('')
    setNewColor(undefined)
    newTextareaRef.current?.focus()
  }, [newText, newColor, onAdd])

  const handleNewNoteKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleAddNote()
      }
    },
    [handleAddNote],
  )

  const handleStartEdit = useCallback((note: Note) => {
    setEditingId(note.id)
    setEditText(note.text)
    setEditColor(note.color)
  }, [])

  const handleCommitEdit = useCallback(() => {
    if (!editingId) return
    const trimmed = editText.trim()
    if (!trimmed) onDelete(editingId)
    else onUpdate(editingId, trimmed, editColor)
    setEditingId(null)
  }, [editingId, editText, editColor, onUpdate, onDelete])

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleCommitEdit()
      }
    },
    [handleCommitEdit],
  )

  const handleCancelEdit = useCallback(() => setEditingId(null), [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (over && active.id !== over.id) {
        const oldIndex = notes.findIndex((n) => n.id === active.id)
        const newIndex = notes.findIndex((n) => n.id === over.id)
        if (oldIndex !== -1 && newIndex !== -1) onReorder(oldIndex, newIndex)
      }
    },
    [notes, onReorder],
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] animate-in fade-in duration-200"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Notes for ${dateLabel}`}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[301] w-[92vw] sm:w-[460px] max-h-[85vh] overflow-y-auto bg-[var(--color-surface-raised)] border border-[var(--color-surface-border)] rounded-xl shadow-2xl p-6 flex flex-col gap-5 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] m-0 tracking-tight font-display">
            {dateLabel} Notes
          </h2>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-primary)] transition-colors -mr-2"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Note list with drag-and-drop */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <ul className="flex flex-col gap-1 m-0 p-0 list-none min-h-[4rem]">
            {notes.length === 0 && (
              <li className="flex items-center justify-center py-6 text-[var(--color-text-muted)] text-sm">
                No notes yet. Add one below.
              </li>
            )}
            <SortableContext items={notes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
              {notes.map((note) => (
                <SortableNote
                  key={note.id}
                  note={note}
                  isEditing={editingId === note.id}
                  editText={editText}
                  editTextareaRef={editTextareaRef}
                  onEditTextChange={setEditText}
                  editColor={editColor}
                  onEditColorChange={setEditColor}
                  onEditKeyDown={handleEditKeyDown}
                  onCommitEdit={handleCommitEdit}
                  onCancelEdit={handleCancelEdit}
                  onStartEdit={handleStartEdit}
                  onDelete={onDelete}
                />
              ))}
            </SortableContext>
          </ul>
        </DndContext>

        {/* New note area */}
        <div className="flex flex-col gap-3 pt-4 border-t border-[var(--color-surface-border)]">
          <textarea
            ref={newTextareaRef}
            className="w-full bg-[var(--color-surface-base)] border border-[var(--color-surface-border)] rounded-lg text-lg font-handwriting leading-relaxed px-3 py-2 resize-y outline-none focus:border-[var(--color-brand-400)] focus:ring-1 focus:ring-[var(--color-brand-400)] min-h-[5rem] transition-colors"
            style={{
              color: resolveColor(newColor) ?? 'var(--color-text-primary)',
              ...(newColor && !newColor.startsWith('#')
                ? {}
                : newColor
                ? { backgroundColor: newColor + '1a' }
                : {}),
            }}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={handleNewNoteKeyDown}
            placeholder="Jot something down... (Cmd+Enter to save)"
            rows={2}
          />
          <div className="flex items-center justify-between gap-3">
            <ColorPickerRow selectedColor={newColor} onChange={setNewColor} />
            <button
              className="px-4 py-1.5 text-sm font-semibold bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-500)] rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
              onClick={handleAddNote}
              disabled={!newText.trim()}
            >
              Add Note
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
