import { useState, useRef, useEffect } from 'react'
import { CalendarSearch } from './CalendarSearch'
import type { SearchResult } from '@/utils/searchUtils'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
]

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// Year range: 20 years back and 10 years forward from the viewed year
const YEAR_RANGE_BACK = 20
const YEAR_RANGE_FORWARD = 10

interface CalendarHeaderProps {
  year: number
  month: number
  isCurrentMonth: boolean
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onMonthSelect: (month: number) => void
  onYearSelect: (year: number) => void
  onOpenHabits?: () => void
  onOpenImportantDates?: () => void
  onSearchSelect?: (result: SearchResult) => void
}

type ActivePicker = 'month' | 'year' | null

export function CalendarHeader({
  year,
  month,
  isCurrentMonth,
  onPrev,
  onNext,
  onToday,
  onMonthSelect,
  onYearSelect,
  onOpenHabits,
  onOpenImportantDates,
  onSearchSelect,
}: CalendarHeaderProps) {
  const [activePicker, setActivePicker] = useState<ActivePicker>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close picker on outside click
  useEffect(() => {
    if (!activePicker) return
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActivePicker(null)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [activePicker])

  // Close picker on Escape
  useEffect(() => {
    if (!activePicker) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setActivePicker(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [activePicker])

  function togglePicker(picker: ActivePicker) {
    setActivePicker((prev) => (prev === picker ? null : picker))
  }

  function handleMonthPick(m: number) {
    onMonthSelect(m)
    setActivePicker(null)
  }

  function handleYearPick(y: number) {
    onYearSelect(y)
    setActivePicker(null)
  }

  const years = Array.from(
    { length: YEAR_RANGE_BACK + YEAR_RANGE_FORWARD + 1 },
    (_, i) => year - YEAR_RANGE_BACK + i
  )

  return (
    <div className="calendar-header" ref={containerRef}>
      {/* Prev button */}
      <button
        id="calendar-prev-month"
        onClick={onPrev}
        aria-label="Previous month"
        className="cal-nav-btn"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M11 13L7 9l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Clickable Month + Year label */}
      <div className="cal-label-group">
        {/* Month picker trigger */}
        <div className="cal-picker-anchor">
          <button
            id="calendar-month-picker-btn"
            onClick={() => togglePicker('month')}
            aria-expanded={activePicker === 'month'}
            aria-haspopup="listbox"
            aria-label={`Current month: ${MONTH_NAMES[month]}. Click to change month.`}
            className={['cal-month-label cal-label-btn', activePicker === 'month' ? 'cal-label-btn--active' : ''].join(' ')}
          >
            {MONTH_NAMES[month]}
          </button>

          {/* Month dropdown */}
          {activePicker === 'month' && (
            <div className="cal-picker-dropdown" role="listbox" aria-label="Select month">
              <div className="cal-month-grid">
                {MONTH_SHORT.map((name, i) => (
                  <button
                    key={name}
                    role="option"
                    aria-selected={i === month}
                    id={`cal-month-opt-${i}`}
                    onClick={() => handleMonthPick(i)}
                    className={['cal-picker-item', i === month ? 'cal-picker-item--selected' : ''].join(' ')}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Year picker trigger */}
        <div className="cal-picker-anchor">
          <button
            id="calendar-year-picker-btn"
            onClick={() => togglePicker('year')}
            aria-expanded={activePicker === 'year'}
            aria-haspopup="listbox"
            aria-label={`Current year: ${year}. Click to change year.`}
            className={['cal-month-label cal-label-btn', activePicker === 'year' ? 'cal-label-btn--active' : ''].join(' ')}
          >
            {year}
          </button>

          {/* Year dropdown */}
          {activePicker === 'year' && (
            <div className="cal-picker-dropdown cal-picker-dropdown--year" role="listbox" aria-label="Select year">
              <div className="cal-year-grid">
                {years.map((y) => (
                  <button
                    key={y}
                    role="option"
                    aria-selected={y === year}
                    id={`cal-year-opt-${y}`}
                    onClick={() => handleYearPick(y)}
                    className={['cal-picker-item', y === year ? 'cal-picker-item--selected' : ''].join(' ')}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Next button */}
      <button
        id="calendar-next-month"
        onClick={onNext}
        aria-label="Next month"
        className="cal-nav-btn"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M7 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      {onSearchSelect && <CalendarSearch onSelect={onSearchSelect} />}

      {/* Habits manager */}
      {onOpenHabits && (
        <button
          id="calendar-habits-btn"
          onClick={onOpenHabits}
          aria-label="Manage habits"
          className="cal-habits-btn"
          title="Manage habits"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 1.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6L8 9.9 4.8 11.9l.6-3.6L2.8 5.3l3.6-.5L8 1.5Z"
              stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
          Habits
        </button>
      )}

      {/* Important dates manager */}
      {onOpenImportantDates && (
        <button
          id="calendar-dates-btn"
          onClick={onOpenImportantDates}
          aria-label="Manage important dates"
          className="cal-dates-btn"
          title="Manage important dates"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 1.5l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.4 4.2 13.3l.7-4.3-3.1-3 4.3-.6L8 1.5Z"
              stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
          </svg>
          Dates
        </button>
      )}

      {/* Today button */}
      <button
        id="calendar-today-btn"
        onClick={onToday}
        aria-label="Go to current month"
        aria-hidden={isCurrentMonth}
        className={['cal-today-btn', isCurrentMonth ? 'opacity-0 pointer-events-none' : 'opacity-100'].join(' ')}
        tabIndex={isCurrentMonth ? -1 : 0}
      >
        Today
      </button>
    </div>
  )
}
