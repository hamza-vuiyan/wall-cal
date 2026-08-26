import type { Habit } from '@/services/storage'
import { getDatesInRange, todayKey } from './challengeUtils'

/** Aggregated statistics for a single habit. */
export interface HabitStats {
  /** Consecutive completed scheduled days up to today (0 if broken). */
  currentStreak: number
  /** Longest run of consecutive completed scheduled days. */
  bestStreak: number
  /** Total number of completed days. */
  totalCompletions: number
  /** Number of completed days in the current calendar month. */
  monthCompletions: number
}

function toKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function prevDayKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  return toKey(new Date(y, m - 1, d - 1))
}

function monthCount(set: Set<string>): number {
  const [ty, tm] = todayKey().split('-')
  const prefix = `${ty}-${tm}`
  let c = 0
  for (const d of set) if (d.startsWith(prefix)) c++
  return c
}

/**
 * Computes habit statistics.
 *
 * Streak rule: a streak is consecutive *scheduled* days that were completed.
 * For daily habits, missing a scheduled day breaks the streak. The current
 * streak is still considered alive if today is not yet completed but
 * yesterday was (today is "in progress").
 */
export function getHabitStats(habit: Habit): HabitStats {
  const today = todayKey()
  const set = new Set(habit.completedDates.filter((d) => d >= habit.startDate))

  // ── Current streak ──
  let current = 0
  let cursor = today
  if (!set.has(cursor)) {
    const yesterday = prevDayKey(cursor)
    // If even yesterday is not completed, the streak is broken.
    if (!set.has(yesterday)) {
      return {
        currentStreak: 0,
        bestStreak: 0,
        totalCompletions: set.size,
        monthCompletions: monthCount(set),
      }
    }
    cursor = yesterday
  }
  while (cursor >= habit.startDate) {
    if (set.has(cursor)) {
      current++
      cursor = prevDayKey(cursor)
    } else {
      break
    }
  }

  // ── Best streak (over [startDate, today]) ──
  let best = 0
  let run = 0
  for (const d of getDatesInRange(habit.startDate, today)) {
    if (set.has(d)) {
      run++
      if (run > best) best = run
    } else {
      run = 0
    }
  }

  return {
    currentStreak: current,
    bestStreak: best,
    totalCompletions: set.size,
    monthCompletions: monthCount(set),
  }
}
