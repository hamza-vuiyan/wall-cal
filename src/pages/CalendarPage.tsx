import { useState, useCallback } from 'react'
import { useCalendar } from '@/hooks/useCalendar'
import { useAppStore } from '@/store/useAppStore'
import { CalendarHeader } from '@/components/calendar/CalendarHeader'
import { WeekdayRow } from '@/components/calendar/WeekdayRow'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { NoteEditorModal } from '@/components/calendar/NoteEditorModal'
import type { MarkType, DayColor } from '@/services/storage'

/** Format a YYYY-MM-DD key into a human-readable label like "August 25, 2026" */
function formatDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function CalendarPage() {
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

  const dayEntries  = useAppStore((s) => s.data.days)
  const setMark      = useAppStore((s) => s.setMark)
  const setDayColor  = useAppStore((s) => s.setDayColor)
  const addNote      = useAppStore((s) => s.addNote)
  const updateNote   = useAppStore((s) => s.updateNote)
  const deleteNote   = useAppStore((s) => s.deleteNote)
  const reorderNotes = useAppStore((s) => s.reorderNotes)

  // Which day's note modal is open (YYYY-MM-DD or null)
  const [openNoteDateKey, setOpenNoteDateKey] = useState<string | null>(null)

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

  const activeNotes = openNoteDateKey
    ? (dayEntries[openNoteDateKey]?.notes ?? [])
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
        />
        <div className="calendar-body" role="grid" aria-label={`Calendar for ${displayLabel}`}>
          <WeekdayRow />
          <CalendarGrid
            days={days}
            dayEntries={dayEntries}
            onMarkChange={handleMarkChange}
            onColorChange={handleColorChange}
            onOpenNotes={handleOpenNotes}
          />
        </div>
      </div>

      {/* Note editor modal — rendered here so it's outside the grid stacking context */}
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
    </main>
  )
}
