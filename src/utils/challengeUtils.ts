import type { Challenge } from '@/services/storage'

/** Generate all YYYY-MM-DD date strings between start and end (inclusive) */
export function getDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const start = new Date(startDate + 'T00:00:00')
  const end   = new Date(endDate   + 'T00:00:00')
  const cur   = new Date(start)
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10))
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

/** Calculate total calendar days in the challenge (inclusive) */
export function getTotalDays(challenge: Challenge): number {
  return getDatesInRange(challenge.startDate, challenge.endDate).length
}

/** Number of completed days */
export function getCompletedCount(challenge: Challenge): number {
  return challenge.completedDates.length
}

/** Today in YYYY-MM-DD */
export function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export type ChallengeStatus = 'upcoming' | 'active' | 'completed' | 'expired'

/** Derive the challenge lifecycle status */
export function getChallengeStatus(challenge: Challenge): ChallengeStatus {
  const today = todayKey()
  if (today < challenge.startDate) return 'upcoming'
  // Completed: all scheduled days have been checked off
  const total = getTotalDays(challenge)
  if (total > 0 && getCompletedCount(challenge) >= total) return 'completed'
  if (today > challenge.endDate) return 'expired'
  return 'active'
}

/** Human-readable status badge text */
export function getStatusLabel(challenge: Challenge): string {
  const today = todayKey()
  const status = getChallengeStatus(challenge)

  if (status === 'upcoming') {
    const daysUntil = getDatesInRange(today, challenge.startDate).length - 1
    return `Starts in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`
  }

  if (status === 'active') {
    const total = getTotalDays(challenge)
    const completed = getCompletedCount(challenge)
    const daysLeft = total - completed
    if (daysLeft === 0) return 'Last day!'
    return `${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining`
  }

  if (status === 'completed') return 'Completed ✓'

  // expired
  const completed = getCompletedCount(challenge)
  const total = getTotalDays(challenge)
  return `Ended · ${completed}/${total} completed`
}

/** Completion percentage 0–100 */
export function getPercentage(challenge: Challenge): number {
  const total = getTotalDays(challenge)
  if (total === 0) return 0
  return Math.round((getCompletedCount(challenge) / total) * 100)
}

/** Format a YYYY-MM-DD string to a short readable label e.g. "Aug 25" */
export function formatShortDate(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Format a date range like "Aug 25 → Sep 3" */
export function formatDateRange(challenge: Challenge): string {
  return `${formatShortDate(challenge.startDate)} → ${formatShortDate(challenge.endDate)}`
}
