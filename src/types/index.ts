// Global application types for WallCal

/** Represents the current view/route in the app */
export type AppView = 'home' | 'calendar' | 'settings' | 'challenges'

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

// ── Storage / Persistence (re-exported for convenience) ──────────
import type { DayColor } from '@/services/storage'
export type { WallCalData, DayEntry, UserSettings, MigrationResult, MarkType, Note, DayColor, Task, Challenge, Habit, HabitFrequency, ImportantDate, ImportantDateIcon } from '@/services/storage'

// ── Habits ───────────────────────────────────────────────────────

/** Compact per-day summary of a habit's state, used for calendar rendering. */
export interface HabitDaySummary {
  /** The habit this summary refers to */
  habitId: string
  /** Display name of the habit */
  name: string
  /** Optional colour accent */
  color?: DayColor
  /** Whether the habit is completed on the relevant date */
  completed: boolean
}

