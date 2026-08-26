import type { ImportantDate, ImportantDateIcon } from '@/services/storage'

export const IMPORTANT_DATE_ICONS: {
  id: ImportantDateIcon
  label: string
  emoji: string
}[] = [
  { id: 'birthday', label: 'Birthday', emoji: '🎂' },
  { id: 'exam', label: 'Exam', emoji: '📝' },
  { id: 'deadline', label: 'Deadline', emoji: '⏰' },
  { id: 'interview', label: 'Interview', emoji: '💼' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'celebration', label: 'Celebration', emoji: '🎉' },
  { id: 'health', label: 'Health', emoji: '🏥' },
  { id: 'money', label: 'Money', emoji: '💰' },
  { id: 'star', label: 'Star', emoji: '⭐' },
]

const ICON_BY_ID = Object.fromEntries(
  IMPORTANT_DATE_ICONS.map((i) => [i.id, i])
) as unknown as Record<ImportantDateIcon, { id: ImportantDateIcon; label: string; emoji: string }>

export function iconEmoji(icon?: ImportantDateIcon): string {
  if (!icon) return '📌'
  return ICON_BY_ID[icon]?.emoji ?? '📌'
}

export function iconLabel(icon?: ImportantDateIcon): string {
  if (!icon) return ''
  return ICON_BY_ID[icon]?.label ?? ''
}

/** Sort important dates by date ascending (stable). */
export function sortImportantDates(list: ImportantDate[]): ImportantDate[] {
  return [...list].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}

/** Returns true when the date is today or later. */
export function isUpcoming(dateKey: string): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return dateKey >= today
}
