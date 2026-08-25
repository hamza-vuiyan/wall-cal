import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { CalendarDay } from '@/types'
import type { MarkType, Note, DayColor } from '@/services/storage'
import { DayMark } from './DayMark'
import { MarkPicker } from './MarkPicker'
import { ColorPicker } from './ColorPicker'

// Small inline symbols for the mark action button
const MARK_SYMBOLS: Record<MarkType, string> = { x: '✕', check: '✓', circle: '○' }

interface DayCellProps {
  day: CalendarDay
  mark?: MarkType
  notes?: Note[]
  color?: DayColor
  onMarkChange?: (dateKey: string, mark: MarkType | null) => void
  onOpenNotes?: (dateKey: string) => void
  onColorChange?: (dateKey: string, color: DayColor | null) => void
  children?: ReactNode
}

export function DayCell({
  day, mark, notes, color,
  onMarkChange, onOpenNotes, onColorChange,
  children,
}: DayCellProps) {
  const { dayNumber, isCurrentMonth, isToday, isWeekend } = day
  const [pickerOpen, setPickerOpen]           = useState(false) // mark picker
  const [colorPickerOpen, setColorPickerOpen] = useState(false) // colour picker

  const isInteractive = isCurrentMonth
  const hasNotes      = isCurrentMonth && (notes?.length ?? 0) > 0

  // ── Mark button ───────────────────────────────────────────────
  const handleMarkBtnClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setColorPickerOpen(false)
    setPickerOpen((prev) => !prev)
  }, [])

  const handleMarkSelect = useCallback((selected: MarkType | null) => {
    onMarkChange?.(day.key, selected)
    setPickerOpen(false)
  }, [day.key, onMarkChange])

  // ── Colour button ─────────────────────────────────────────────
  const handleColorBtnClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setPickerOpen(false)
    setColorPickerOpen((prev) => !prev)
  }, [])

  const handleColorSelect = useCallback((selected: DayColor | null) => {
    onColorChange?.(day.key, selected)
    setColorPickerOpen(false)
  }, [day.key, onColorChange])

  // ── Note button / chip ────────────────────────────────────────
  const handleNoteOpen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setPickerOpen(false)
    setColorPickerOpen(false)
    onOpenNotes?.(day.key)
  }, [day.key, onOpenNotes])

  // Close pickers when clicking the cell background
  const handleCellClick = useCallback(() => {
    if (pickerOpen) setPickerOpen(false)
    if (colorPickerOpen) setColorPickerOpen(false)
  }, [pickerOpen, colorPickerOpen])

  return (
    <div
      role="gridcell"
      aria-label={day.date.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })}
      aria-current={isToday ? 'date' : undefined}
      data-date={day.key}
      onClick={handleCellClick}
      className={[
        'cal-day-cell',
        isCurrentMonth ? 'cal-day-cell--current' : 'cal-day-cell--adjacent',
        isWeekend && isCurrentMonth ? 'cal-day-cell--weekend' : '',
        isToday ? 'cal-day-cell--today' : '',
        isInteractive ? 'cal-day-cell--interactive' : '',
        pickerOpen || colorPickerOpen ? 'cal-day-cell--picker-open' : '',
        color && isCurrentMonth ? `cal-day-cell--color-${color}` : '',
      ].filter(Boolean).join(' ')}
    >
      {/* ── Header row: date number + action buttons ── */}
      <div className="cal-day-header">
        <span className={isToday ? 'cal-day-number cal-day-number--today' : 'cal-day-number'}>
          {dayNumber}
        </span>

        {isInteractive && (
          <div className="cal-day-actions">

            {/* Mark button */}
            <button
              className={[
                'cal-day-action-btn cal-day-action-btn--mark',
                mark ? `cal-day-action-btn--marked cal-day-action-btn--mark-${mark}` : '',
                pickerOpen ? 'cal-day-action-btn--active' : '',
              ].filter(Boolean).join(' ')}
              onClick={handleMarkBtnClick}
              aria-label={mark ? `Mark: ${mark}. Click to change` : 'Add a mark'}
              aria-haspopup="menu"
              aria-expanded={pickerOpen}
              title={mark ? `Mark: ${mark}` : 'Add mark'}
            >
              {mark ? MARK_SYMBOLS[mark] : <span className="cal-action-placeholder">◎</span>}
            </button>

            {/* Colour button */}
            <button
              className={[
                'cal-day-action-btn cal-day-action-btn--color',
                color ? `cal-day-action-btn--colored cal-day-action-btn--color-${color}` : '',
                colorPickerOpen ? 'cal-day-action-btn--active' : '',
              ].filter(Boolean).join(' ')}
              onClick={handleColorBtnClick}
              aria-label={color ? `Colour: ${color}. Click to change` : 'Highlight day'}
              aria-haspopup="menu"
              aria-expanded={colorPickerOpen}
              title={color ? `Highlighted: ${color}` : 'Highlight'}
            >
              {/* Paint-bucket icon */}
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M1.5 9C1.5 9 3 7.5 3 6.5C3 5.672 2.328 5 1.5 5C0.672 5 0 5.672 0 6.5C0 7.5 1.5 9 1.5 9Z" fill="currentColor"/>
                <path d="M10.5 1.5L8 4M8 4L4 8L2 6L6 2L8 4Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.5 5.5C9.5 5.5 12 7 12 8.5C12 9.328 11.328 10 10.5 10C9.672 10 9 9.328 9 8.5C9 7 9.5 5.5 9.5 5.5Z" fill="currentColor"/>
              </svg>
              {color && <span className={`cal-color-dot cal-color-dot--${color}`} aria-hidden="true" />}
            </button>

            {/* Note button */}
            <button
              className={[
                'cal-day-action-btn cal-day-action-btn--note',
                hasNotes ? 'cal-day-action-btn--has-notes' : '',
              ].filter(Boolean).join(' ')}
              onClick={handleNoteOpen}
              aria-label={hasNotes
                ? `${notes!.length} note${notes!.length > 1 ? 's' : ''}. Click to edit`
                : 'Add a note'}
              title={hasNotes ? 'View / edit notes' : 'Add note'}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M8.5 1.5L10.5 3.5L3.5 10.5H1.5V8.5L8.5 1.5Z"
                  stroke="currentColor" strokeWidth="1.3"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {hasNotes && <span className="cal-note-count">{notes!.length}</span>}
            </button>

          </div>
        )}
      </div>

      {/* ── Mark display ── */}
      {mark && isCurrentMonth && <DayMark type={mark} />}

      {/* ── Note chip preview + children ── */}
      <div className={[
        'cal-day-content',
        hasNotes ? 'cal-day-content--has-notes' : '',
      ].filter(Boolean).join(' ')}>
        {hasNotes && (
          <div
            className="cal-day-note-chip"
            onClick={handleNoteOpen}
            role="button"
            tabIndex={-1}
            aria-label="Open notes"
          >
            <div className="cal-day-note-list">
              {notes!.slice(0, 10).map((note) => (
                <p key={note.id} className="note-chip-text">{note.text}</p>
              ))}
            </div>
            {notes!.length > 5 && (
              <span className="note-chip-more">+{notes!.length - 5} more</span>
            )}
          </div>
        )}
        {children}
      </div>

      {/* ── Mark picker ── */}
      {pickerOpen && isInteractive && (
        <MarkPicker
          currentMark={mark}
          onSelect={handleMarkSelect}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {/* ── Colour picker ── */}
      {colorPickerOpen && isInteractive && (
        <ColorPicker
          currentColor={color}
          onSelect={handleColorSelect}
          onClose={() => setColorPickerOpen(false)}
        />
      )}
    </div>
  )
}
