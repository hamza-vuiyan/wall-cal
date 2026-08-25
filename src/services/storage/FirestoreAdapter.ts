import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/services/firebase/config'
import type { StorageAdapter } from './StorageAdapter'
import type { WallCalData } from './types'

// ── Firestore Document Path ───────────────────────────────────────
// Structure: users/{uid}/profile/data
// A single document per user is sufficient for Phase 3 (skeleton data only).
// Phase 4+ will extend with sub-collections as day content grows.

function userDocRef(uid: string) {
  return doc(db, 'users', uid, 'profile', 'data')
}

// ── Debounce helper ───────────────────────────────────────────────

function debounce<T extends unknown[]>(
  fn: (...args: T) => Promise<void>,
  ms: number
): (...args: T) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: T) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args).catch((err) =>
        console.error('[WallCal] Debounced save failed:', err)
      )
    }, ms)
  }
}

/**
 * Persists WallCalData to Cloud Firestore.
 * Used when the user is authenticated.
 *
 * Writes are debounced 800ms to avoid excessive Firestore writes.
 * Real-time updates are delivered via onSnapshot.
 * Offline reads/writes are handled automatically by the Firebase SDK
 * (IndexedDB persistence is enabled in config.ts).
 */
export class FirestoreAdapter implements StorageAdapter {
  private readonly uid: string
  private readonly debouncedSave: (data: WallCalData) => void

  constructor(uid: string) {
    this.uid = uid
    this.debouncedSave = debounce(this._writeToFirestore.bind(this), 800)
  }

  async load(): Promise<WallCalData | null> {
    try {
      const snap = await getDoc(userDocRef(this.uid))
      if (!snap.exists()) return null
      return snap.data() as WallCalData
    } catch (err) {
      console.error('[WallCal] Firestore load failed:', err)
      return null
    }
  }

  /** Debounced public save — safe to call on every state change */
  save(data: WallCalData): Promise<void> {
    this.debouncedSave(data)
    return Promise.resolve()
  }

  /** Immediate write — used internally after debounce fires */
  private async _writeToFirestore(data: WallCalData): Promise<void> {
    await setDoc(userDocRef(this.uid), {
      ...data,
      // Overwrite updatedAt with a server-side timestamp for consistency
      updatedAt: serverTimestamp(),
    })
  }

  async clear(): Promise<void> {
    try {
      await deleteDoc(userDocRef(this.uid))
    } catch (err) {
      console.error('[WallCal] Firestore clear failed:', err)
    }
  }

  /**
   * Subscribes to real-time Firestore updates via onSnapshot.
   * The callback fires immediately with cached data (offline-first),
   * then again whenever the server document changes.
   */
  subscribe(callback: (data: WallCalData) => void): () => void {
    const unsubscribe: Unsubscribe = onSnapshot(
      userDocRef(this.uid),
      (snap) => {
        if (snap.exists()) {
          callback(snap.data() as WallCalData)
        }
      },
      (err) => {
        console.error('[WallCal] Firestore snapshot error:', err)
      }
    )
    return unsubscribe
  }
}
