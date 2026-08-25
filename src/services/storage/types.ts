// ── WallCal Data Model ────────────────────────────────────────────
//
// All future features (marks, notes, tasks, habits, challenges, colours,
// drawings, important dates) write into this envelope. The shape is designed
// to grow in place: new fields are always optional so older stored data
// deserialises cleanly without a migration.

/** The visual mark types a user can place on a day */
export type MarkType = 'x' | 'check' | 'circle'

/** A single note written on a calendar day */
export interface Note {
  /** Unique ID: base-36 timestamp + random suffix */
  id: string
  /** The note text content */
  text: string
  /** Unix timestamp (ms) when the note was created */
  createdAt: number
  /** Unix timestamp (ms) when the note was last edited */
  updatedAt: number
}

/** Token representing a highlight colour for a calendar day */
export type DayColor =
  | 'yellow' | 'orange' | 'red' | 'pink'
  | 'purple' | 'blue'   | 'cyan' | 'green'

/** Ordered colour palette shown in the colour picker */
export const DAY_COLOR_PALETTE: { id: DayColor; label: string }[] = [
  { id: 'yellow', label: 'Yellow'  },
  { id: 'orange', label: 'Orange'  },
  { id: 'red',    label: 'Red'     },
  { id: 'pink',   label: 'Pink'    },
  { id: 'purple', label: 'Purple'  },
  { id: 'blue',   label: 'Blue'    },
  { id: 'cyan',   label: 'Teal'    },
  { id: 'green',  label: 'Green'   },
]

/** A task associated with a specific calendar day */
export interface Task {
  /** Unique ID: base-36 timestamp + random suffix */
  id: string
  /** Required task title */
  title: string
  /** ISO date key the task belongs to: "YYYY-MM-DD" */
  date: string
  /** Optional time string in "HH:MM" 24-hour format */
  time?: string
  /** Optional longer description */
  description?: string
  /** Whether the task has been completed */
  completed: boolean
  /** Optional colour accent for this task */
  color?: DayColor
  /** Unix timestamp (ms) when the task was created */
  createdAt: number
  /** Unix timestamp (ms) when the task was last edited */
  updatedAt: number
}

/** Per-day data entry. Future phases add optional fields here. */
export interface DayEntry {
  /** ISO date key: "YYYY-MM-DD" */
  key: string
  /** Unix timestamp (ms) of the last modification — used for merge conflict resolution */
  updatedAt: number
  /** Optional mark placed on this day */
  mark?: MarkType
  /** Notes written on this day, ordered by creation time */
  notes?: Note[]
  /** Optional highlight colour for this day */
  color?: DayColor
  /** Tasks associated with this day */
  tasks?: Task[]
  // Future phases: drawing, etc.
}

/** User-level preferences */
export interface UserSettings {
  /** First day of the week */
  weekStart: 'sunday' | 'monday'
  /** UI theme (future) */
  theme: 'dark' | 'light' | 'system'
}

/** Root data envelope stored per user */
export interface WallCalData {
  /** Schema version — increment when breaking changes require migration */
  version: number
  /** Map of "YYYY-MM-DD" → DayEntry */
  days: Record<string, DayEntry>
  /** User preferences */
  settings: UserSettings
  /** Unix timestamp (ms) of the last write */
  updatedAt: number
}

/** Describes the outcome of a guest → cloud migration attempt */
export interface MigrationResult {
  status: 'uploaded' | 'merged' | 'skipped' | 'empty'
  /** Human-readable message shown to the user */
  message: string
}

// ── Factory ────────────────────────────────────────────────────────

/** Creates a fresh, empty WallCalData document */
export function createEmptyData(): WallCalData {
  return {
    version: 1,
    days: {},
    settings: {
      weekStart: 'sunday',
      theme: 'dark',
    },
    updatedAt: Date.now(),
  }
}

/**
 * Deep-merges two WallCalData objects.
 * Per-day conflicts are resolved by highest `updatedAt` (newest wins).
 * Settings from `remote` take precedence unless `local` is newer overall.
 */
export function mergeData(local: WallCalData, remote: WallCalData): WallCalData {
  const mergedDays: Record<string, DayEntry> = { ...remote.days }

  for (const [key, localDay] of Object.entries(local.days)) {
    const remoteDay = remote.days[key]
    if (!remoteDay || localDay.updatedAt > remoteDay.updatedAt) {
      mergedDays[key] = localDay
    }
  }

  // Settings: whichever data is overall newer wins
  const settings = local.updatedAt > remote.updatedAt ? local.settings : remote.settings

  return {
    version: Math.max(local.version, remote.version),
    days: mergedDays,
    settings,
    updatedAt: Date.now(),
  }
}
