const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function WeekdayRow() {
  return (
    <div className="calendar-weekday-row" role="row" aria-label="Days of the week">
      {WEEKDAYS.map((day, index) => (
        <div
          key={day}
          role="columnheader"
          aria-label={day}
          className={[
            'cal-weekday-label',
            // Subtle weekend tint on header labels too
            index === 0 || index === 6 ? 'cal-weekday-label--weekend' : '',
          ].join(' ')}
        >
          {day}
        </div>
      ))}
    </div>
  )
}
