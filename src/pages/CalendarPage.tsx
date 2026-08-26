import { useState, useCallback } from 'react'
import { useCalendar } from '@/hooks/useCalendar'
import { useAppStore } from '@/store/useAppStore'
import { CalendarHeader } from '@/components/calendar/CalendarHeader'
import { WeekdayRow } from '@/components/calendar/WeekdayRow'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { NoteEditorModal } from '@/components/calendar/NoteEditorModal'
import { TaskListModal } from '@/components/calendar/TaskListModal'
import { HabitManagerModal, HabitDayModal } from '@/components/habits'
import type { MarkType, DayColor, Task } from '@/services/storage'

import type { AppView } from '@/types'

/** Format a YYYY-MM-DD key into a human-readable label like "August 25, 2026" */
function formatDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

interface CalendarPageProps {
  onNavigate?: (view: AppView) => void
}

export function CalendarPage({ onNavigate }: CalendarPageProps) {
  const {
    year,
    month,
    displayLabel,
    days,
    isCurrentMonth,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    goToMonth,
    goToYear,
  } = useCalendar()

  const dayEntries   = useAppStore((s) => s.data.days)
  const setMark      = useAppStore((s) => s.setMark)
  const setDayColor  = useAppStore((s) => s.setDayColor)
  const addNote      = useAppStore((s) => s.addNote)
  const updateNote   = useAppStore((s) => s.updateNote)
  const deleteNote   = useAppStore((s) => s.deleteNote)
  const reorderNotes = useAppStore((s) => s.reorderNotes)
  const addTask      = useAppStore((s) => s.addTask)
  const updateTask   = useAppStore((s) => s.updateTask)
  const toggleTask   = useAppStore((s) => s.toggleTask)
  const deleteTask   = useAppStore((s) => s.deleteTask)
  const challengesData = useAppStore((s) => s.data.challenges)
  const challenges   = challengesData ?? []

  const habitsData   = useAppStore((s) => s.data.habits)
  const habits       = habitsData ?? []
  const addHabit     = useAppStore((s) => s.addHabit)
  const updateHabit  = useAppStore((s) => s.updateHabit)
  const deleteHabit  = useAppStore((s) => s.deleteHabit)

  // Which day's note modal is open (YYYY-MM-DD or null)
  const [openNoteDateKey, setOpenNoteDateKey] = useState<string | null>(null)
  // Which day's task modal is open
  const [openTaskDateKey, setOpenTaskDateKey] = useState<string | null>(null)
  // Habit manager modal open flag
  const [habitManagerOpen, setHabitManagerOpen] = useState(false)
  // Which day's habit modal is open
  const [openHabitDateKey, setOpenHabitDateKey] = useState<string | null>(null)

  const handleMarkChange = useCallback(
    (dateKey: string, mark: MarkType | null) => setMark(dateKey, mark),
    [setMark]
  )

  const handleColorChange = useCallback(
    (dateKey: string, color: DayColor | null) => setDayColor(dateKey, color),
    [setDayColor]
  )

  const handleOpenNotes = useCallback(
    (dateKey: string) => setOpenNoteDateKey(dateKey),
    []
  )

  const handleCloseNotes = useCallback(() => setOpenNoteDateKey(null), [])

  const handleOpenTasks = useCallback(
    (dateKey: string) => setOpenTaskDateKey(dateKey),
    []
  )

  const handleCloseTasks = useCallback(() => setOpenTaskDateKey(null), [])

  const handleChallengeDotClick = useCallback(() => {
    if (onNavigate) {
      onNavigate('challenges')
    }
  }, [onNavigate])

  const handleOpenHabitsManager = useCallback(() => setHabitManagerOpen(true), [])
  const handleCloseHabitsManager = useCallback(() => setHabitManagerOpen(false), [])

  const handleOpenHabits = useCallback(
    (dateKey: string) => setOpenHabitDateKey(dateKey),
    []
  )
  const handleCloseHabits = useCallback(() => setOpenHabitDateKey(null), [])

  const activeNotes = openNoteDateKey
    ? (dayEntries[openNoteDateKey]?.notes ?? [])
    : []

  const activeTasks = openTaskDateKey
    ? (dayEntries[openTaskDateKey]?.tasks ?? [])
    : []

  return (
    <main id="main-content" className="calendar-page">
      <div className="calendar-wrapper">
        <CalendarHeader
          year={year}
          month={month}
          isCurrentMonth={isCurrentMonth}
          onPrev={goToPrevMonth}
          onNext={goToNextMonth}
          onToday={goToToday}
          onMonthSelect={goToMonth}
          onYearSelect={goToYear}
          onOpenHabits={handleOpenHabitsManager}
        />
        <div className="calendar-body" role="grid" aria-label={`Calendar for ${displayLabel}`}>
          <WeekdayRow />
          <CalendarGrid
            days={days}
            dayEntries={dayEntries}
            challenges={challenges}
            habits={habits}
            onMarkChange={handleMarkChange}
            onColorChange={handleColorChange}
            onOpenNotes={handleOpenNotes}
            onOpenTasks={handleOpenTasks}
            onChallengeClick={handleChallengeDotClick}
            onOpenHabits={handleOpenHabits}
          />
        </div>
      </div>

      {/* Note editor modal */}
      {openNoteDateKey && (
        <NoteEditorModal
          dateKey={openNoteDateKey}
          dateLabel={formatDateKey(openNoteDateKey)}
          notes={activeNotes}
          onAdd={(text) => addNote(openNoteDateKey, text)}
          onUpdate={(id, text) => updateNote(openNoteDateKey, id, text)}
          onDelete={(id) => deleteNote(openNoteDateKey, id)}
          onReorder={(from, to) => reorderNotes(openNoteDateKey, from, to)}
          onClose={handleCloseNotes}
        />
      )}

      {/* Task list modal */}
      {openTaskDateKey && (
        <TaskListModal
          dateKey={openTaskDateKey}
          dateLabel={formatDateKey(openTaskDateKey)}
          tasks={activeTasks}
          onToggle={(id) => toggleTask(openTaskDateKey, id)}
          onDelete={(id) => deleteTask(openTaskDateKey, id)}
          onUpdate={(id, changes) => updateTask(openTaskDateKey, id, changes)}
          onAdd={(data) => addTask(openTaskDateKey, data as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>)}
          onClose={handleCloseTasks}
        />
      )}

      {/* Habit manager modal */}
      {habitManagerOpen && (
        <HabitManagerModal
          habits={habits}
          onAdd={(data) => addHabit(data)}
          onUpdate={(id, changes) => updateHabit(id, changes)}
          onDelete={(id) => deleteHabit(id)}
          onClose={handleCloseHabitsManager}
        />
      )}

      {/* Per-date habit modal */}
      {openHabitDateKey && (
        <HabitDayModal
          dateKey={openHabitDateKey}
          dateLabel={formatDateKey(openHabitDateKey)}
          onClose={handleCloseHabits}
        />
      )}
    </main>
  )
}
