import type { ReactNode } from 'react'
import type { CalendarDay } from '@/types'
import type { MarkType, DayEntry } from '@/services/storage'
import { DayCell } from './DayCell'

interface CalendarGridProps {
  days: CalendarDay[]
  /** Map of dateKey → DayEntry from the app store */
  dayEntries?: Record<string, DayEntry>
  /** Called when the user selects or removes a mark */
  onMarkChange?: (dateKey: string, mark: MarkType | null) => void
  /**
   * Optional render prop for additional day content.
   * Phase 4+: pass tasks/notes/habits/etc.
   */
  renderDayContent?: (day: CalendarDay) => ReactNode
}

export function CalendarGrid({
  days,
  dayEntries,
  onMarkChange,
  renderDayContent,
}: CalendarGridProps) {
  return (
    <div
      role="grid"
      aria-label="Monthly calendar"
      className="calendar-grid"
    >
      {days.map((day) => (
        <DayCell
          key={day.key}
          day={day}
          mark={dayEntries?.[day.key]?.mark}
          onMarkChange={onMarkChange}
        >
          {renderDayContent?.(day)}
        </DayCell>
      ))}
    </div>
  )
}
