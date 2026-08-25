// ── WallCal Data Model ────────────────────────────────────────────
//
// All future features (marks, notes, tasks, habits, challenges, colours,
// drawings, important dates) write into this envelope. The shape is designed
// to grow in place: new fields are always optional so older stored data
// deserialises cleanly without a migration.

/** The visual mark types a user can place on a day */
export type MarkType = 'x' | 'check' | 'circle'

/** Per-day data entry. Future phases add optional fields here. */
export interface DayEntry {
  /** ISO date key: "YYYY-MM-DD" */
  key: string
  /** Unix timestamp (ms) of the last modification — used for merge conflict resolution */
  updatedAt: number
  /** Optional mark placed on this day */
  mark?: MarkType
  // Future phases: note, color, taskIds, drawingRef, etc.
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
