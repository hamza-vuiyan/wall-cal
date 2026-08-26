import type { WallCalData } from '@/services/storage'

export const BACKUP_FORMAT = 'wallcal-backup'
export const BACKUP_FORMAT_VERSION = 1

/** A WallCal backup envelope wrapping the full data document. */
export interface WallCalBackup {
  format: 'wallcal-backup'
  /** Backup format version. Tolerated as `>= 1` for forward-compat. */
  version: number
  /** ISO timestamp of when the backup was created. */
  exportedAt: string
  /** The full data envelope (days, challenges, habits, importantDates, settings, version, updatedAt). */
  data: WallCalData
}

/**
 * Serialises a WallCalData document into a pretty-printed backup JSON string.
 */
export function serializeBackup(data: WallCalData): string {
  const backup: WallCalBackup = {
    format: BACKUP_FORMAT,
    version: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  }
  return JSON.stringify(backup, null, 2)
}

/**
 * Parses and validates a backup file's raw text.
 * Throws a clear Error on malformed JSON or invalid structure so callers can
 * display a friendly message without crashing.
 */
export function parseBackup(raw: string): WallCalBackup {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('This file is not valid JSON.')
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Backup file is not a recognised object.')
  }

  const obj = parsed as Record<string, unknown>

  if (obj.format !== BACKUP_FORMAT) {
    throw new Error('This is not a WallCal backup file (missing format marker).')
  }

  if (typeof obj.version !== 'number' || obj.version < 1) {
    throw new Error('Unrecognised backup version.')
  }

  const data = obj.data
  if (typeof data !== 'object' || data === null) {
    throw new Error('Backup is missing its data envelope.')
  }

  const dataObj = data as Record<string, unknown>
  if (typeof dataObj.version !== 'number') {
    throw new Error('Backup data is missing its schema version.')
  }
  if (typeof dataObj.days !== 'object' || dataObj.days === null) {
    throw new Error('Backup data has no "days" map.')
  }

  return obj as unknown as WallCalBackup
}

/**
 * Triggers a browser download of the given data as a WallCal backup JSON file.
 * Pure DOM — no external dependency.
 */
export function downloadBackup(data: WallCalData, filename?: string): void {
  const name =
    filename ?? `wallcal-backup-${new Date().toISOString().slice(0, 10)}.json`
  const blob = new Blob([serializeBackup(data)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
