import type { ReactNode } from 'react'
import type { CalendarDay } from '@/types'
import type { MarkType, DayEntry } from '@/services/storage'
import { DayCell } from './DayCell'

interface CalendarGridProps {
  days: CalendarDay[]
  dayEntries?: Record<string, DayEntry>
  onMarkChange?: (dateKey: string, mark: MarkType | null) => void
  onOpenNotes?: (dateKey: string) => void
  renderDayContent?: (day: CalendarDay) => ReactNode
}

export function CalendarGrid({
  days,
  dayEntries,
  onMarkChange,
  onOpenNotes,
  renderDayContent,
}: CalendarGridProps) {
  return (
    <div role="grid" aria-label="Monthly calendar" className="calendar-grid">
      {days.map((day) => (
        <DayCell
          key={day.key}
          day={day}
          mark={dayEntries?.[day.key]?.mark}
          notes={dayEntries?.[day.key]?.notes}
          onMarkChange={onMarkChange}
          onOpenNotes={onOpenNotes}
        >
          {renderDayContent?.(day)}
        </DayCell>
      ))}
    </div>
  )
}
