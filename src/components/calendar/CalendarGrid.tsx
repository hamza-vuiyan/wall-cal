import type { ReactNode } from 'react'
import type { CalendarDay } from '@/types'
import { DayCell } from './DayCell'

interface CalendarGridProps {
  days: CalendarDay[]
  /**
   * Optional render prop for day content.
   * Phase 2: unused. Phase 3+: pass tasks/notes/etc.
   *
   * @example
   * renderDayContent={(day) => <TaskList date={day.date} />}
   */
  renderDayContent?: (day: CalendarDay) => ReactNode
}

export function CalendarGrid({ days, renderDayContent }: CalendarGridProps) {
  return (
    <div
      role="grid"
      aria-label="Monthly calendar"
      className="calendar-grid"
    >
      {days.map((day) => (
        <DayCell key={day.key} day={day}>
          {renderDayContent?.(day)}
        </DayCell>
      ))}
    </div>
  )
}
