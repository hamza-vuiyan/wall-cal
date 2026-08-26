import type { WallCalData, DayColor, ImportantDateIcon } from '@/services/storage'

export type SearchResultType =
  | 'note'
  | 'task'
  | 'challenge'
  | 'habit'
  | 'importantDate'

export interface SearchResult {
  /** Stable key: `${type}:${id}` (used as React list key + identity) */
  id: string
  type: SearchResultType
  /** Human label for the type, e.g. "Note", "Important date" */
  typeLabel: string
  /** YYYY-MM-DD the result should navigate to */
  dateKey: string
  /** Human-readable date, e.g. "August 12" or "August 12, 2027" */
  dateLabel: string
  /** The relevant text that matched */
  text: string
  /** Optional secondary line (range, time, category, etc.) */
  detail?: string
  /** Optional colour accent */
  color?: DayColor
}

const TYPE_LABELS: Record<SearchResultType, string> = {
  note: 'Note',
  task: 'Task',
  challenge: 'Challenge',
  habit: 'Habit',
  importantDate: 'Important date',
}

const TYPE_ORDER: Record<SearchResultType, number> = {
  note: 0,
  task: 1,
  importantDate: 2,
  challenge: 3,
  habit: 4,
}

const IMPORTANT_DATE_ICON_LABELS: Record<ImportantDateIcon, string> = {
  birthday: 'birthday',
  exam: 'exam',
  deadline: 'deadline',
  interview: 'interview',
  travel: 'travel',
  celebration: 'celebration',
  health: 'health',
  money: 'money',
  star: 'star',
}

function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}

/** Splits a query into lowercase tokens; a match requires ALL tokens present. */
function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
}

function matchesAllTokens(haystack: string, tokens: string[]): boolean {
  if (tokens.length === 0) return false
  return tokens.every((t) => haystack.includes(t))
}

/**
 * Runs a fast, local, case-insensitive substring search across all WallCal
 * user content (notes, tasks, challenges, habits, important dates).
 *
 * - Multi-token queries use AND semantics (every token must appear).
 * - Each challenge/habit yields a single row anchored to its startDate.
 * - Results are sorted by date ascending, then by a fixed type order.
 * - Capped at 50 rows to keep the dropdown light.
 */
export function runSearch(data: WallCalData, rawQuery: string): SearchResult[] {
  const tokens = tokenize(rawQuery)
  if (tokens.length === 0) return []
  const results: SearchResult[] = []

  // ── Notes & Tasks (live inside day entries) ──
  for (const day of Object.values(data.days)) {
    const dateKey = day.key
    const dateLabel = formatDateLabel(dateKey)

    for (const note of day.notes ?? []) {
      const haystack = note.text.toLowerCase()
      if (matchesAllTokens(haystack, tokens)) {
        results.push({
          id: `note:${note.id}`,
          type: 'note',
          typeLabel: TYPE_LABELS.note,
          dateKey,
          dateLabel,
          text: note.text,
          color: day.color,
        })
      }
    }

    for (const task of day.tasks ?? []) {
      const haystack = [task.title, task.description ?? '', task.time ?? '']
        .join(' ')
        .toLowerCase()
      if (matchesAllTokens(haystack, tokens)) {
        results.push({
          id: `task:${task.id}`,
          type: 'task',
          typeLabel: TYPE_LABELS.task,
          dateKey,
          dateLabel,
          text: task.title,
          detail: task.time ?? undefined,
          color: task.color ?? day.color,
        })
      }
    }
  }

  // ── Challenges (anchored to startDate, shows range) ──
  for (const ch of data.challenges ?? []) {
    const haystack = [ch.name, ch.description ?? ''].join(' ').toLowerCase()
    if (matchesAllTokens(haystack, tokens)) {
      results.push({
        id: `challenge:${ch.id}`,
        type: 'challenge',
        typeLabel: TYPE_LABELS.challenge,
        dateKey: ch.startDate,
        dateLabel: formatDateLabel(ch.startDate),
        text: ch.name,
        detail: `${formatDateLabel(ch.startDate)} → ${formatDateLabel(ch.endDate)}`,
        color: ch.color,
      })
    }
  }

  // ── Habits (anchored to startDate) ──
  for (const habit of data.habits ?? []) {
    const haystack = [habit.name].join(' ').toLowerCase()
    if (matchesAllTokens(haystack, tokens)) {
      results.push({
        id: `habit:${habit.id}`,
        type: 'habit',
        typeLabel: TYPE_LABELS.habit,
        dateKey: habit.startDate,
        dateLabel: formatDateLabel(habit.startDate),
        text: habit.name,
        detail: 'Daily habit',
        color: habit.color,
      })
    }
  }

  // ── Important dates ──
  for (const imp of data.importantDates ?? []) {
    const haystack = [
      imp.title,
      imp.description ?? '',
      imp.category ?? '',
      imp.icon ? IMPORTANT_DATE_ICON_LABELS[imp.icon] : '',
    ]
      .join(' ')
      .toLowerCase()
    if (matchesAllTokens(haystack, tokens)) {
      results.push({
        id: `importantDate:${imp.id}`,
        type: 'importantDate',
        typeLabel: TYPE_LABELS.importantDate,
        dateKey: imp.date,
        dateLabel: formatDateLabel(imp.date),
        text: imp.title,
        detail: [
          imp.icon ? IMPORTANT_DATE_ICON_LABELS[imp.icon] : '',
          imp.category ?? '',
        ]
          .filter(Boolean)
          .join(' · ') || undefined,
        color: imp.color,
      })
    }
  }

  results.sort((a, b) => {
    if (a.dateKey !== b.dateKey) return a.dateKey < b.dateKey ? -1 : 1
    return TYPE_ORDER[a.type] - TYPE_ORDER[b.type]
  })

  return results.slice(0, 50)
}
