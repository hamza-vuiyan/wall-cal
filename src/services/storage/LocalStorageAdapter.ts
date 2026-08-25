import type { StorageAdapter } from './StorageAdapter'
import type { WallCalData } from './types'
import { createEmptyData } from './types'

const STORAGE_KEY = 'wallcal_guest_data'

/**
 * Persists WallCalData to browser localStorage.
 * Used in guest (unauthenticated) mode.
 */
export class LocalStorageAdapter implements StorageAdapter {
  async load(): Promise<WallCalData | null> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as WallCalData
      // Basic sanity check — if version is missing we treat it as empty
      if (typeof parsed.version !== 'number') return null
      return parsed
    } catch {
      console.warn('[WallCal] Failed to read guest data from localStorage.')
      return null
    }
  }

  async save(data: WallCalData): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      console.warn('[WallCal] Failed to write guest data to localStorage.')
    }
  }

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY)
  }

  /**
   * LocalStorage has no real-time change API.
   * Returns a noop unsubscribe — the store re-loads on demand instead.
   */
  subscribe(_callback: (data: WallCalData) => void): () => void {
    return () => {}
  }

  /**
   * Convenience: load the raw guest data synchronously (for migration).
   * Returns a fresh empty envelope if nothing is stored.
   */
  loadSync(): WallCalData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return createEmptyData()
      return JSON.parse(raw) as WallCalData
    } catch {
      return createEmptyData()
    }
  }
}

/** Singleton instance — reused across the app */
export const localStorageAdapter = new LocalStorageAdapter()
