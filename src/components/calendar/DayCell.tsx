import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { CalendarDay } from '@/types'
import type { MarkType, Note } from '@/services/storage'
import { DayMark } from './DayMark'
import { MarkPicker } from './MarkPicker'

// Small inline symbols for the mark action button
const MARK_SYMBOLS: Record<MarkType, string> = { x: '✕', check: '✓', circle: '○' }

interface DayCellProps {
  day: CalendarDay
  mark?: MarkType
  notes?: Note[]
  onMarkChange?: (dateKey: string, mark: MarkType | null) => void
  onOpenNotes?: (dateKey: string) => void
  children?: ReactNode
}

export function DayCell({ day, mark, notes, onMarkChange, onOpenNotes, children }: DayCellProps) {
  const { dayNumber, isCurrentMonth, isToday, isWeekend } = day
  const [pickerOpen, setPickerOpen] = useState(false)

  const isInteractive = isCurrentMonth
  const hasNotes = isCurrentMonth && (notes?.length ?? 0) > 0

  // ── Mark button ───────────────────────────────────────────────
  const handleMarkBtnClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setPickerOpen((prev) => !prev)
    },
    []
  )

  const handleMarkSelect = useCallback(
    (selected: MarkType | null) => {
      onMarkChange?.(day.key, selected)
      setPickerOpen(false)
    },
    [day.key, onMarkChange]
  )

  // ── Note button / chip ────────────────────────────────────────
  const handleNoteOpen = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setPickerOpen(false)
      onOpenNotes?.(day.key)
    },
    [day.key, onOpenNotes]
  )

  // Close picker when clicking the cell background (empty space)
  const handleCellClick = useCallback(() => {
    if (pickerOpen) setPickerOpen(false)
  }, [pickerOpen])

  return (
    <div
      role="gridcell"
      aria-label={day.date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
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
        pickerOpen ? 'cal-day-cell--picker-open' : '',
      ].filter(Boolean).join(' ')}
    >
      {/* ── Header row: date number + action buttons ── */}
      <div className="cal-day-header">
        <span className={isToday ? 'cal-day-number cal-day-number--today' : 'cal-day-number'}>
          {dayNumber}
        </span>

        {/* Action buttons — only on current-month cells */}
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

            {/* Note button */}
            <button
              className={[
                'cal-day-action-btn cal-day-action-btn--note',
                hasNotes ? 'cal-day-action-btn--has-notes' : '',
              ].filter(Boolean).join(' ')}
              onClick={handleNoteOpen}
              aria-label={hasNotes ? `${notes!.length} note${notes!.length > 1 ? 's' : ''}. Click to edit` : 'Add a note'}
              title={hasNotes ? 'View / edit notes' : 'Add note'}
            >
              {/* Pencil icon */}
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path
                  d="M8.5 1.5L10.5 3.5L3.5 10.5H1.5V8.5L8.5 1.5Z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {hasNotes && <span className="cal-note-count">{notes!.length}</span>}
            </button>
          </div>
        )}
      </div>

      {/* ── Mark display (center of cell) ── */}
      {mark && isCurrentMonth && <DayMark type={mark} />}

      {/* ── Note chip preview (bottom) ── */}
      {hasNotes && (
        <div
          className="cal-day-note-chip"
          onClick={handleNoteOpen}
          role="button"
          tabIndex={-1}
          aria-label="Open notes"
        >
          <p className="note-chip-text">{notes![0].text}</p>
          {notes!.length > 1 && (
            <span className="note-chip-more">+{notes!.length - 1} more</span>
          )}
        </div>
      )}

      {/* Extra content slot */}
      <div className="cal-day-content">{children}</div>

      {/* ── Mark picker popover ── */}
      {pickerOpen && isInteractive && (
        <MarkPicker
          currentMark={mark}
          onSelect={handleMarkSelect}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  )
}
