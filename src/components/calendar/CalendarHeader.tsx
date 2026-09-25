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
  onOpenWishlist?: () => void
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
  onOpenWishlist,
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
        {/* Repeat/loop icon — habit tracking */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
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
        {/* Calendar with bookmark — important dates */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <path d="M9 16l2 2 4-4" />
          </svg>
          Dates
        </button>
      )}

      {/* Wishlist manager */}
      {onOpenWishlist && (
        <button
          id="calendar-wishlist-btn"
          onClick={onOpenWishlist}
          aria-label="Manage bucket list"
          className="cal-dates-btn"
          title="Manage bucket list"
        >
        {/* Gift/heart-list icon — wishlist */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          Wishlist
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
