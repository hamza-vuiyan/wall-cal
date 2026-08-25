import { useCalendar } from '@/hooks/useCalendar'
import { CalendarHeader } from '@/components/calendar/CalendarHeader'
import { WeekdayRow } from '@/components/calendar/WeekdayRow'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'

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
          <CalendarGrid days={days} />
        </div>
      </div>
    </main>
  )
}
