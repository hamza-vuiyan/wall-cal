// Global application types for WallCal

/** Represents the current view/route in the app */
export type AppView = 'home' | 'calendar' | 'settings'

/** Generic status type for async operations */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

/** Generic key-value record */
export type StringRecord = Record<string, string>

// ── Calendar ─────────────────────────────────────────────────────

/** A single cell in the monthly calendar grid (always 42 cells = 6 weeks). */
export interface CalendarDay {
  /** The underlying Date object for this cell */
  date: Date
  /** Day-of-month number (1–31) */
  dayNumber: number
  /** True when this day belongs to the currently displayed month */
  isCurrentMonth: boolean
  /** True when this day is today */
  isToday: boolean
  /** True for Sunday (0) and Saturday (6) */
  isWeekend: boolean
  /** Unique stable key for React lists: "YYYY-MM-DD" */
  key: string
}
