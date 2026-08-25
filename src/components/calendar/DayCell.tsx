import type { ReactNode } from 'react'
import type { CalendarDay } from '@/types'

interface DayCellProps {
  day: CalendarDay
  /**
   * Slot for Phase 3+ content (tasks, notes, etc.)
   * Renders nothing in Phase 2.
   */
  children?: ReactNode
}

export function DayCell({ day, children }: DayCellProps) {
  const { dayNumber, isCurrentMonth, isToday, isWeekend } = day

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
      className={[
        'cal-day-cell',
        isCurrentMonth ? 'cal-day-cell--current' : 'cal-day-cell--adjacent',
        isWeekend && isCurrentMonth ? 'cal-day-cell--weekend' : '',
        isToday ? 'cal-day-cell--today' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Date number — top-left, like a physical calendar */}
      <div className="cal-day-number-wrapper">
        <span className={isToday ? 'cal-day-number cal-day-number--today' : 'cal-day-number'}>
          {dayNumber}
        </span>
      </div>

      {/* Content area — empty now, populated in later phases */}
      <div className="cal-day-content">{children}</div>
    </div>
  )
}
