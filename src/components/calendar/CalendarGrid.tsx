import { useMemo } from 'react'
import type { ReactNode } from 'react'
import type { CalendarDay, HabitDaySummary } from '@/types'
import type { MarkType, DayEntry, DayColor, Challenge, Habit } from '@/services/storage'
import { DayCell } from './DayCell'

interface CalendarGridProps {
  days: CalendarDay[]
  dayEntries?: Record<string, DayEntry>
  challenges?: Challenge[]
  habits?: Habit[]
  onMarkChange?: (dateKey: string, mark: MarkType | null) => void
  onOpenNotes?: (dateKey: string) => void
  onColorChange?: (dateKey: string, color: DayColor | null) => void
  onOpenTasks?: (dateKey: string) => void
  onChallengeClick?: () => void
  onOpenHabits?: (dateKey: string) => void
  renderDayContent?: (day: CalendarDay) => ReactNode
}

export function CalendarGrid({
  days,
  dayEntries,
  challenges = [],
  habits = [],
  onMarkChange,
  onOpenNotes,
  onColorChange,
  onOpenTasks,
  onChallengeClick,
  onOpenHabits,
  renderDayContent,
}: CalendarGridProps) {
  // Build a per-date summary of scheduled habits (independent of tasks/notes).
  const habitMap = useMemo(() => {
    const map: Record<string, HabitDaySummary[]> = {}
    for (const habit of habits) {
      const completed = new Set(habit.completedDates)
      for (const day of days) {
        if (day.key < habit.startDate) continue
        ;(map[day.key] ??= []).push({
          habitId: habit.id,
          name: habit.name,
          color: habit.color,
          completed: completed.has(day.key),
        })
      }
    }
    return map
  }, [habits, days])

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

        const dayHabits = habitMap[day.key]

        return (
          <DayCell
            key={day.key}
            day={day}
            mark={dayEntries?.[day.key]?.mark}
            notes={dayEntries?.[day.key]?.notes}
            color={dayEntries?.[day.key]?.color}
            tasks={dayEntries?.[day.key]?.tasks}
            challengeDots={challengeDots.length > 0 ? challengeDots : undefined}
            habits={dayHabits && dayHabits.length > 0 ? dayHabits : undefined}
            onMarkChange={onMarkChange}
            onOpenNotes={onOpenNotes}
            onColorChange={onColorChange}
            onOpenTasks={onOpenTasks}
            onChallengeClick={onChallengeClick}
            onOpenHabits={onOpenHabits}
          >
            {renderDayContent?.(day)}
          </DayCell>
        )
      })}
    </div>
  )
}
