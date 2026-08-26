import type { StorageAdapter } from './StorageAdapter'
import type { WallCalData, MigrationResult } from './types'
import { createEmptyData, mergeData } from './types'
import { localStorageAdapter, LocalStorageAdapter } from './LocalStorageAdapter'
import { FirestoreAdapter } from './FirestoreAdapter'

/**
 * Decides which storage adapter to use and orchestrates guest → cloud migration.
 *
 * The Zustand store is the only caller of this service.
 * All calendar components stay completely unaware of Firebase or localStorage.
 */
class PersistenceService {
  private adapter: StorageAdapter = localStorageAdapter
  private currentUnsubscribe: (() => void) | null = null

  /** Switch to guest (localStorage) mode */
  useGuestMode(): void {
    this.currentUnsubscribe?.()
    this.currentUnsubscribe = null
    this.adapter = localStorageAdapter
  }

  /** Switch to authenticated (Firestore) mode for the given user */
  useCloudMode(uid: string): void {
    this.currentUnsubscribe?.()
    this.currentUnsubscribe = null
    this.adapter = new FirestoreAdapter(uid)
  }

  async load(): Promise<WallCalData> {
    const data = await this.adapter.load()
    return data ?? createEmptyData()
  }

  async save(data: WallCalData): Promise<void> {
    await this.adapter.save({ ...data, updatedAt: Date.now() })
  }

  /**
   * Subscribes to real-time data changes (Firestore live updates).
   * For guest mode this is a noop unsubscribe.
   * Automatically cancels the previous subscription when called again.
   */
  subscribe(callback: (data: WallCalData) => void): () => void {
    this.currentUnsubscribe?.()
    const unsub = this.adapter.subscribe(callback)
    this.currentUnsubscribe = unsub
    return () => {
      unsub()
      this.currentUnsubscribe = null
    }
  }

  /**
   * Migrates guest localStorage data to Firestore after sign-in.
   *
   * Strategy:
   *  1. Read guest data from localStorage
   *  2. If guest data is empty → nothing to migrate
   *  3. Read existing cloud data for this uid
   *  4. If no cloud data → upload guest data as-is, clear localStorage
   *  5. If cloud data exists → merge (newest DayEntry wins per key),
   *     upload merged result, clear localStorage
   *
   * Returns a MigrationResult describing what happened.
   */
  async migrateGuestToCloud(uid: string): Promise<MigrationResult> {
    const guestAdapter = new LocalStorageAdapter()
    const guestData = guestAdapter.loadSync()

    // Nothing in localStorage — skip
    const hasGuestContent =
      Object.keys(guestData.days).length > 0 ||
      (guestData.challenges?.length ?? 0) > 0 ||
      (guestData.habits?.length ?? 0) > 0 ||
      (guestData.importantDates?.length ?? 0) > 0

    if (!hasGuestContent) {
      return { status: 'empty', message: '' }
    }

    const cloudAdapter = new FirestoreAdapter(uid)
    const cloudData = await cloudAdapter.load()

    let result: WallCalData
    let status: MigrationResult['status']

    if (!cloudData) {
      // No cloud data yet — upload guest data directly
      result = { ...guestData, updatedAt: Date.now() }
      status = 'uploaded'
    } else {
      // Both exist — merge
      result = mergeData(guestData, cloudData)
      status = 'merged'
    }

    // Write merged result immediately (bypass debounce)
    await cloudAdapter.load() // warm up connection
    await cloudAdapter['_writeToFirestore'](result).catch(async () => {
      // Fallback: use the debounced path
      cloudAdapter.save(result)
    })

    // Clear guest data from localStorage
    await guestAdapter.clear()

    return {
      status,
      message:
        status === 'uploaded'
          ? 'Your guest data has been saved to your account.'
          : 'Your guest data has been merged with your cloud account.',
    }
  }
}

/** Singleton — import this wherever persistence is needed */
export const persistenceService = new PersistenceService()
