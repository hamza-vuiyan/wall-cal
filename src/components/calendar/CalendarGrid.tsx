import type { ReactNode } from 'react'
import type { CalendarDay } from '@/types'
import type { MarkType, DayEntry, DayColor, Challenge } from '@/services/storage'
import { DayCell } from './DayCell'

interface CalendarGridProps {
  days: CalendarDay[]
  dayEntries?: Record<string, DayEntry>
  challenges?: Challenge[]
  onMarkChange?: (dateKey: string, mark: MarkType | null) => void
  onOpenNotes?: (dateKey: string) => void
  onColorChange?: (dateKey: string, color: DayColor | null) => void
  onOpenTasks?: (dateKey: string) => void
  onChallengeClick?: () => void
  renderDayContent?: (day: CalendarDay) => ReactNode
}

export function CalendarGrid({
  days,
  dayEntries,
  challenges = [],
  onMarkChange,
  onOpenNotes,
  onColorChange,
  onOpenTasks,
  onChallengeClick,
  renderDayContent,
}: CalendarGridProps) {
  return (
    <div role="grid" aria-label="Monthly calendar" className="calendar-grid">
      {days.map((day) => {
        // Find challenges that overlap this day
        const dayChallenges = challenges.filter(
          (c) => day.key >= c.startDate && day.key <= c.endDate
        )
        const challengeDots = dayChallenges.map((c) => ({
          challengeId: c.id,
          color: c.color,
        }))

        return (
          <DayCell
            key={day.key}
            day={day}
            mark={dayEntries?.[day.key]?.mark}
            notes={dayEntries?.[day.key]?.notes}
            color={dayEntries?.[day.key]?.color}
            tasks={dayEntries?.[day.key]?.tasks}
            challengeDots={challengeDots.length > 0 ? challengeDots : undefined}
            onMarkChange={onMarkChange}
            onOpenNotes={onOpenNotes}
            onColorChange={onColorChange}
            onOpenTasks={onOpenTasks}
            onChallengeClick={onChallengeClick}
          >
            {renderDayContent?.(day)}
          </DayCell>
        )
      })}
    </div>
  )
}
