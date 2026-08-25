import type { WallCalData } from './types'

/**
 * Common interface implemented by both LocalStorageAdapter and FirestoreAdapter.
 *
 * Calendar components and the Zustand store ONLY interact with this interface —
 * they never import firebase or localStorage APIs directly.
 */
export interface StorageAdapter {
  /**
   * Loads the full WallCalData from the backing store.
   * Returns null if no data exists yet.
   */
  load(): Promise<WallCalData | null>

  /**
   * Persists the full WallCalData to the backing store.
   */
  save(data: WallCalData): Promise<void>

  /**
   * Removes all WallCal data from the backing store.
   * Used after a successful guest → cloud migration.
   */
  clear(): Promise<void>

  /**
   * Subscribes to real-time data changes.
   * - FirestoreAdapter: uses onSnapshot for live cloud updates.
   * - LocalStorageAdapter: noop — returns an immediate unsubscribe function.
   *
   * @returns Unsubscribe function — call on cleanup.
   */
  subscribe(callback: (data: WallCalData) => void): () => void
}
