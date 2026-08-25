import { useCalendar } from '@/hooks/useCalendar'
import { useAppStore } from '@/store/useAppStore'
import { CalendarHeader } from '@/components/calendar/CalendarHeader'
import { WeekdayRow } from '@/components/calendar/WeekdayRow'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import type { MarkType } from '@/services/storage'

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

  const dayEntries = useAppStore((s) => s.data.days)
  const setMark = useAppStore((s) => s.setMark)

  function handleMarkChange(dateKey: string, mark: MarkType | null) {
    setMark(dateKey, mark)
  }

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
          />
        </div>
      </div>
    </main>
  )
}
