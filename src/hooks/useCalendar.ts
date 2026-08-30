import { useState, useMemo } from 'react'
import type { CalendarDay } from '@/types'

// ── Helpers ───────────────────────────────────────────────────────

function toKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * Builds the 42-cell (6-week) grid for the given year/month.
 * Week starts on Sunday (index 0).
 *
 * @param year  - Full calendar year (e.g. 2026)
 * @param month - 0-indexed month (0 = January, 11 = December)
 * @param today - Reference "today" date (injected for testability)
 */
function buildGrid(year: number, month: number, today: Date): CalendarDay[] {
  const firstOfMonth = new Date(year, month, 1)
  // Sunday = 0, so no adjustment needed for Sunday-first layout
  const startOffset = firstOfMonth.getDay() // 0–6

  // Always generate exactly 42 cells (6 full weeks)
  const TOTAL_CELLS = 42
  const days: CalendarDay[] = []

  for (let i = 0; i < TOTAL_CELLS; i++) {
    const date = new Date(year, month, 1 - startOffset + i)
    const dow = date.getDay() // 0 = Sun, 6 = Sat

    days.push({
      date,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: isSameDay(date, today),
      isWeekend: dow === 0 || dow === 6,
      key: toKey(date),
    })
  }

  return days
}

// ── Hook ──────────────────────────────────────────────────────────

export interface UseCalendarReturn {
  /** Currently displayed year */
  year: number
  /** Currently displayed month (0-indexed) */
  month: number
  /** Human-readable label, e.g. "August 2026" */
  displayLabel: string
  /** 42-cell grid of CalendarDay objects */
  days: CalendarDay[]
  /** True when the displayed month is the same as today's month */
  isCurrentMonth: boolean
  goToPrevMonth: () => void
  goToNextMonth: () => void
  /** Navigate back to the month containing today */
  goToToday: () => void
  /** Jump directly to a specific month (0-indexed) in the current year */
  goToMonth: (month: number) => void
  /** Jump directly to a specific year, keeping current month */
  goToYear: (year: number) => void
  /** Navigate to the month containing the given YYYY-MM-DD date */
  goToDate: (dateKey: string) => void
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const fallbackToday = new Date()
let globalViewDate = {
  year: fallbackToday.getFullYear(),
  month: fallbackToday.getMonth(),
}

export let globalHasScrolledToToday = false
export const setGlobalHasScrolledToToday = (val: boolean) => {
  globalHasScrolledToToday = val
}

/**
 * Core calendar state and navigation logic.
 */
export function useCalendar(): UseCalendarReturn {
  const today = useMemo(() => new Date(), [])

  const [viewDate, setViewDateState] = useState<{ year: number; month: number }>(globalViewDate)

  const setViewDate = (val: React.SetStateAction<{ year: number; month: number }>) => {
    setViewDateState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val
      globalViewDate = next
      return next
    })
  }

  const { year, month } = viewDate

  const days = useMemo(() => buildGrid(year, month, today), [year, month, today])

  const displayLabel = `${MONTH_NAMES[month]} ${year}`

  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth()

  const goToPrevMonth = () =>
    setViewDate(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    )

  const goToNextMonth = () =>
    setViewDate(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    )

  const goToToday = () =>
    setViewDate({ year: today.getFullYear(), month: today.getMonth() })

  const goToMonth = (m: number) =>
    setViewDate(({ year }) => ({ year, month: m }))

  const goToYear = (y: number) =>
    setViewDate(({ month }) => ({ year: y, month }))

  const goToDate = (dateKey: string) => {
    const [y, m] = dateKey.split('-').map(Number)
    if (Number.isFinite(y) && Number.isFinite(m)) {
      setViewDate({ year: y, month: m - 1 })
    }
  }

  return {
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
  }
}
