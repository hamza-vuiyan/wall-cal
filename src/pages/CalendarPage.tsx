import { useState, useCallback, useEffect } from 'react'
import { useCalendar } from '@/hooks/useCalendar'
import { useAppStore } from '@/store/useAppStore'
import { CalendarHeader } from '@/components/calendar/CalendarHeader'
import { WeekdayRow } from '@/components/calendar/WeekdayRow'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { NoteEditorModal } from '@/components/calendar/NoteEditorModal'
import { TaskListModal } from '@/components/calendar/TaskListModal'
import { HabitManagerModal, HabitDayModal } from '@/components/habits'
import { ImportantDateManagerModal, ImportantDateListModal } from '@/components/importantdates'
import type { MarkType, DayColor, Task } from '@/services/storage'
import type { SearchResult } from '@/utils/searchUtils'

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
    goToDate,
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

  const importantDatesData = useAppStore((s) => s.data.importantDates)
  const importantDates     = importantDatesData ?? []
  const addImportantDate   = useAppStore((s) => s.addImportantDate)
  const updateImportantDate = useAppStore((s) => s.updateImportantDate)
  const deleteImportantDate = useAppStore((s) => s.deleteImportantDate)

  // Which day's note modal is open (YYYY-MM-DD or null)
  const [openNoteDateKey, setOpenNoteDateKey] = useState<string | null>(null)
  // Which day's task modal is open
  const [openTaskDateKey, setOpenTaskDateKey] = useState<string | null>(null)
  // Habit manager modal open flag
  const [habitManagerOpen, setHabitManagerOpen] = useState(false)
  // Which day's habit modal is open
  const [openHabitDateKey, setOpenHabitDateKey] = useState<string | null>(null)
  // Important-date manager + per-day modals
  const [impManagerOpen, setImpManagerOpen] = useState(false)
  const [openImpDateKey, setOpenImpDateKey] = useState<string | null>(null)
  // Date highlighted after a search navigation (persistent ring)
  const [foundDateKey, setFoundDateKey] = useState<string | null>(null)

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

  const handleOpenImpManager = useCallback(() => setImpManagerOpen(true), [])
  const handleCloseImpManager = useCallback(() => setImpManagerOpen(false), [])

  const handleOpenImportantDates = useCallback(
    (dateKey: string) => setOpenImpDateKey(dateKey),
    []
  )
  const handleCloseImportantDates = useCallback(() => setOpenImpDateKey(null), [])

  // Search result → jump to month + highlight the date (persistent until next interaction)
  const handleSearchSelect = useCallback((result: SearchResult) => {
    goToDate(result.dateKey)
    setFoundDateKey(result.dateKey)
  }, [goToDate])

  // Clear the found ring whenever the user navigates months/years or interacts with a cell
  const clearFound = useCallback(() => setFoundDateKey(null), [])
  const handleCellInteract = useCallback((dateKey: string) => {
    setFoundDateKey(null)
    const [y, m] = dateKey.split('-').map(Number)
    if (y !== year || m - 1 !== month) {
      goToDate(dateKey)
    }
  }, [year, month, goToDate])
  const handlePrev = useCallback(() => { clearFound(); goToPrevMonth() }, [clearFound, goToPrevMonth])
  const handleNext = useCallback(() => { clearFound(); goToNextMonth() }, [clearFound, goToNextMonth])
  const handleToday = useCallback(() => { 
    clearFound(); 
    goToToday(); 
    setTimeout(() => {
      const todayCell = document.querySelector('.cal-day-cell--today');
      if (todayCell) {
        todayCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, [clearFound, goToToday])
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const todayCell = document.querySelector('.cal-day-cell--today')
      if (todayCell) {
        todayCell.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleMonth = useCallback((m: number) => { clearFound(); goToMonth(m) }, [clearFound, goToMonth])
  const handleYear = useCallback((y: number) => { clearFound(); goToYear(y) }, [clearFound, goToYear])

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
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
          onMonthSelect={handleMonth}
          onYearSelect={handleYear}
          onOpenHabits={handleOpenHabitsManager}
          onOpenImportantDates={handleOpenImpManager}
          onSearchSelect={handleSearchSelect}
        />
        <div className="calendar-body" role="grid" aria-label={`Calendar for ${displayLabel}`}>
          <WeekdayRow />
          <CalendarGrid
            days={days}
            dayEntries={dayEntries}
            challenges={challenges}
            habits={habits}
            importantDates={importantDates}
            foundDateKey={foundDateKey}
            onMarkChange={handleMarkChange}
            onColorChange={handleColorChange}
            onOpenNotes={handleOpenNotes}
            onOpenTasks={handleOpenTasks}
            onChallengeClick={handleChallengeDotClick}
            onOpenHabits={handleOpenHabits}
            onOpenImportantDates={handleOpenImportantDates}
            onCellInteract={handleCellInteract}
          />
        </div>
      </div>

      {/* Note editor modal */}
      {openNoteDateKey && (
        <NoteEditorModal
          dateKey={openNoteDateKey}
          dateLabel={formatDateKey(openNoteDateKey)}
          notes={activeNotes}
          onAdd={(text, color) => addNote(openNoteDateKey, text, color)}
          onUpdate={(id, text, color) => updateNote(openNoteDateKey, id, text, color)}
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

      {/* Important dates manager modal */}
      {impManagerOpen && (
        <ImportantDateManagerModal
          importantDates={importantDates}
          onAdd={(data) => addImportantDate(data)}
          onUpdate={(id, changes) => updateImportantDate(id, changes)}
          onDelete={(id) => deleteImportantDate(id)}
          onClose={handleCloseImpManager}
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

      {/* Per-date important dates modal */}
      {openImpDateKey && (
        <ImportantDateListModal
          dateKey={openImpDateKey}
          dateLabel={formatDateKey(openImpDateKey)}
          onClose={handleCloseImportantDates}
        />
      )}
    </main>
  )
}
