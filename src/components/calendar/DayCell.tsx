import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { CalendarDay, HabitDaySummary } from '@/types'
import type { MarkType, Note, DayColor, Task, ImportantDate } from '@/services/storage'
import { iconEmoji } from '@/utils/importantDateUtils'
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
  tasks?: Task[]
  challengeDots?: { challengeId: string; color?: DayColor }[]
  habits?: HabitDaySummary[]
  importantDates?: ImportantDate[]
  found?: boolean
  onMarkChange?: (dateKey: string, mark: MarkType | null) => void
  onOpenNotes?: (dateKey: string) => void
  onColorChange?: (dateKey: string, color: DayColor | null) => void
  onOpenTasks?: (dateKey: string) => void
  onChallengeClick?: () => void
  onOpenHabits?: (dateKey: string) => void
  onOpenImportantDates?: (dateKey: string) => void
  onCellInteract?: (dateKey: string) => void
  children?: ReactNode
}

export function DayCell({
  day, mark, notes, color, tasks, challengeDots, habits, importantDates, found = false,
  onMarkChange, onOpenNotes, onColorChange, onOpenTasks, onChallengeClick, onOpenHabits,
  onOpenImportantDates, onCellInteract,
  children,
}: DayCellProps) {
  const { dayNumber, isCurrentMonth, isToday, isWeekend } = day
  const [pickerOpen, setPickerOpen]           = useState(false)
  const [colorPickerOpen, setColorPickerOpen] = useState(false)

  const isInteractive = isCurrentMonth
  const hasNotes      = isCurrentMonth && (notes?.length ?? 0) > 0
  const hasTasks      = isCurrentMonth && (tasks?.length ?? 0) > 0
  const showHabits    = isCurrentMonth && (habits?.length ?? 0) > 0
  const showImportant = isCurrentMonth && (importantDates?.length ?? 0) > 0

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

  // ── Habit strip button ───────────────────────────────────────
  const handleHabitOpen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setPickerOpen(false)
    setColorPickerOpen(false)
    onOpenHabits?.(day.key)
  }, [day.key, onOpenHabits])

  // ── Important dates strip button ───────────────────────────────
  const handleImportantOpen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setPickerOpen(false)
    setColorPickerOpen(false)
    onOpenImportantDates?.(day.key)
  }, [day.key, onOpenImportantDates])

  // ── Task button ─────────────────────────────────────────────────
  const handleTaskOpen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setPickerOpen(false)
    setColorPickerOpen(false)
    onOpenTasks?.(day.key)
  }, [day.key, onOpenTasks])

  // Close pickers when clicking the cell background
  const handleCellClick = useCallback(() => {
    if (pickerOpen) setPickerOpen(false)
    if (colorPickerOpen) setColorPickerOpen(false)
    onCellInteract?.(day.key)
  }, [pickerOpen, colorPickerOpen, day.key, onCellInteract])

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
        found ? 'cal-day-cell--found' : '',
        color && isCurrentMonth ? `cal-day-cell--color-${color}` : '',
      ].filter(Boolean).join(' ')}
    >
      {/* ── Background Mark ── */}
      {mark && isCurrentMonth && <DayMark type={mark} />}

      {/* ── Top Left: Day Number ── */}
      <div className="cal-day-top">
        <span className={isToday ? 'cal-day-number cal-day-number--today' : 'cal-day-number'}>
          {dayNumber}
        </span>
      </div>

      {/* ── Hover Actions ── */}
      {isInteractive && (
        <div className="cal-day-actions">
          <button
            className={['cal-day-action-btn cal-day-action-btn--mark', mark ? `cal-day-action-btn--marked cal-day-action-btn--mark-${mark}` : '', pickerOpen ? 'cal-day-action-btn--active' : ''].filter(Boolean).join(' ')}
            onClick={handleMarkBtnClick} title={mark ? `Mark: ${mark}` : 'Add mark'}
          >
            {mark ? MARK_SYMBOLS[mark] : <span className="cal-action-placeholder">◎</span>}
          </button>
          <button
            className={['cal-day-action-btn cal-day-action-btn--color', color ? `cal-day-action-btn--colored cal-day-action-btn--color-${color}` : '', colorPickerOpen ? 'cal-day-action-btn--active' : ''].filter(Boolean).join(' ')}
            onClick={handleColorBtnClick} title={color ? `Highlighted: ${color}` : 'Highlight'}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1.5 9C1.5 9 3 7.5 3 6.5C3 5.672 2.328 5 1.5 5C0.672 5 0 5.672 0 6.5C0 7.5 1.5 9 1.5 9Z" fill="currentColor"/><path d="M10.5 1.5L8 4M8 4L4 8L2 6L6 2L8 4Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.5 5.5C9.5 5.5 12 7 12 8.5C12 9.328 11.328 10 10.5 10C9.672 10 9 9.328 9 8.5C9 7 9.5 5.5 9.5 5.5Z" fill="currentColor"/></svg>
            {color && <span className={`cal-color-dot cal-color-dot--${color}`} />}
          </button>
          <button className="cal-day-action-btn" onClick={handleTaskOpen} title={hasTasks ? 'View / manage tasks' : 'Add task'}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="1.5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" /></svg>
          </button>
          <button className="cal-day-action-btn" onClick={handleNoteOpen} title={hasNotes ? 'View / edit notes' : 'Add note'}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5L10.5 3.5L3.5 10.5H1.5V8.5L8.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      )}

      {/* ── Bottom Edge Indicators ── */}
      <div className="cal-day-bottom-indicators">

        
        {/* Challenges */}
        {challengeDots && challengeDots.length > 0 && isCurrentMonth && (
          <button onClick={(e) => { e.stopPropagation(); onChallengeClick?.(); }} className="cal-indicator-dots-group" title="Challenges">
            {challengeDots.slice(0, 3).map((dot, i) => (
              <span key={i} className={`cal-challenge-dot${dot.color ? ` cal-challenge-dot--${dot.color}` : ''}`} />
            ))}
          </button>
        )}

        {/* Habits */}
        {showHabits && (
          <button onClick={handleHabitOpen} className="cal-indicator-dots-group" title="Habits">
            {habits!.slice(0, 3).map((h, i) => (
              <span key={i} className={['cal-habit-dot', h.completed ? 'cal-habit-dot--done' : '', h.color ? `cal-habit-dot--${h.color}` : ''].filter(Boolean).join(' ')} />
            ))}
          </button>
        )}

        {/* Tasks */}
        {hasTasks && (
          <button onClick={handleTaskOpen} className="cal-indicator-icon" title="Tasks">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1.5" y="1.5" width="9" height="9" rx="2"/><path d="M3.5 6L5 7.5L8.5 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="sr-only">Tasks</span>
          </button>
        )}
      </div>

      {/* Content Previews (Important + Tasks + Notes) */}
      {(hasNotes || hasTasks || showImportant) && (
        <div className="cal-day-content-preview">
          
          {/* Important date chips — compact, at the very top */}
          {showImportant && (
            <div
              className="cal-imp-strip"
              onClick={handleImportantOpen}
              role="button"
              tabIndex={-1}
              aria-label="Open important dates"
              title="Important dates"
            >
              {importantDates!.slice(0, 2).map((imp) => (
                <span
                  key={imp.id}
                  className={[
                    'cal-imp-chip',
                    imp.color ? `cal-imp-chip--${imp.color}` : '',
                  ].filter(Boolean).join(' ')}
                  title={`${imp.title}${imp.category ? ` · ${imp.category}` : ''}`}
                  aria-label={imp.title}
                >
                  <span className="cal-imp-chip-icon" aria-hidden="true">{iconEmoji(imp.icon)}</span>
                  <span className="cal-imp-chip-title">{imp.title}</span>
                </span>
              ))}
              {importantDates!.length > 2 && (
                <span className="cal-imp-more">+{importantDates!.length - 2}</span>
              )}
            </div>
          )}
          
          {/* Tasks first */}
          {hasTasks && tasks!.slice(0, 3).map((task) => {
            let displayTime = task.time;
            if (displayTime) {
              const parts = displayTime.split(':');
              if (parts.length === 2) {
                let h = parseInt(parts[0], 10);
                const ampm = h >= 12 ? 'pm' : 'am';
                h = h % 12 || 12;
                displayTime = `${h}:${parts[1]}${ampm}`;
              }
            }
            return (
              <div 
                key={task.id} 
                className={['cal-task-text-snippet', task.completed ? 'cal-task-text-snippet--done' : ''].filter(Boolean).join(' ')}
                onClick={(e) => { handleTaskOpen(e); }}
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1.5" y="1.5" width="9" height="9" rx="2"/>{task.completed && <path d="M3.5 6L5 7.5L8.5 4" strokeLinecap="round" strokeLinejoin="round"/>}</svg>
                {displayTime && <span className="cal-task-time-snippet">{displayTime}</span>}
                <span className="cal-task-title-snippet">{task.title}</span>
              </div>
            );
          })}
          {hasTasks && tasks!.length > 3 && (
            <div className="cal-note-text-more" onClick={(e) => { handleTaskOpen(e); }}>+{tasks!.length - 3} tasks</div>
          )}

          {/* Notes second */}
          {hasNotes && (
            <>
              {notes!.slice(0, hasTasks ? 3 : 6).map((note) => (
                <div key={note.id} className="cal-note-text-snippet" onClick={(e) => { handleNoteOpen(e); }}>
                  {note.text}
                </div>
              ))}
              {notes!.length > (hasTasks ? 3 : 6) && (
                <div className="cal-note-text-more" onClick={(e) => { handleNoteOpen(e); }}>+{notes!.length - (hasTasks ? 3 : 6)} notes</div>
              )}
            </>
          )}

        </div>
      )}

      {children}

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
