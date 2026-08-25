import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { CalendarDay } from '@/types'
import type { MarkType } from '@/services/storage'
import { DayMark } from './DayMark'
import { MarkPicker } from './MarkPicker'

interface DayCellProps {
  day: CalendarDay
  mark?: MarkType
  onMarkChange?: (dateKey: string, mark: MarkType | null) => void
  /** Slot for future content (tasks, notes, etc.) */
  children?: ReactNode
}

export function DayCell({ day, mark, onMarkChange, children }: DayCellProps) {
  const { dayNumber, isCurrentMonth, isToday, isWeekend } = day
  const [pickerOpen, setPickerOpen] = useState(false)

  // Only current-month days are interactive
  const isInteractive = isCurrentMonth

  const handleCellClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isInteractive) return
      e.stopPropagation()
      setPickerOpen((prev) => !prev)
    },
    [isInteractive]
  )

  const handleMarkSelect = useCallback(
    (selected: MarkType | null) => {
      onMarkChange?.(day.key, selected)
    },
    [day.key, onMarkChange]
  )

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
      aria-haspopup={isInteractive ? 'menu' : undefined}
      aria-expanded={isInteractive ? pickerOpen : undefined}
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
      {/* Date number — top-left */}
      <div className="cal-day-number-wrapper">
        <span className={isToday ? 'cal-day-number cal-day-number--today' : 'cal-day-number'}>
          {dayNumber}
        </span>
      </div>

      {/* Mark display */}
      {mark && isCurrentMonth && <DayMark type={mark} />}

      {/* Future content slot */}
      <div className="cal-day-content">{children}</div>

      {/* Mark picker popover */}
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
