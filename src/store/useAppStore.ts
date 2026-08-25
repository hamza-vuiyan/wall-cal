import { create } from 'zustand'
import type { User } from 'firebase/auth'
import { signInWithGoogle, signOut, onAuthStateChange } from '@/services/auth'
import { persistenceService } from '@/services/storage'
import type { WallCalData, DayEntry, UserSettings, MigrationResult, MarkType } from '@/services/storage'
import { createEmptyData } from '@/services/storage'

// ── Auth state ────────────────────────────────────────────────────

export type AuthStatus = 'loading' | 'guest' | 'authenticated'

// ── Store shape ───────────────────────────────────────────────────

interface AppState {
  // Auth
  authStatus: AuthStatus
  user: User | null
  authError: string | null

  // Data
  data: WallCalData
  isDataLoading: boolean
  dataError: string | null

  // Migration
  migrationResult: MigrationResult | null

  // Actions — Auth
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  clearAuthError: () => void
  dismissMigration: () => void

  // Actions — Data
  updateSettings: (settings: Partial<UserSettings>) => void
  updateDay: (key: string, entry: Partial<DayEntry>) => void
  /** Set or remove a mark on a specific date. Pass null to clear. */
  setMark: (dateKey: string, mark: MarkType | null) => void

  // Internal
  _setData: (data: WallCalData) => void
  _initAuth: () => () => void
}

// ── Store ─────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────
  authStatus: 'loading',
  user: null,
  authError: null,

  data: createEmptyData(),
  isDataLoading: true,
  dataError: null,

  migrationResult: null,

  // ── Internal setter (used by persistence subscription) ─────────
  _setData: (data) => set({ data, isDataLoading: false }),

  // ── Auth actions ───────────────────────────────────────────────

  signIn: async () => {
    set({ authError: null })
    try {
      await signInWithGoogle()
      // onAuthStateChange (wired in _initAuth) handles the rest
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      // Suppress "popup closed by user" — not a real error
      if (!msg.includes('popup-closed') && !msg.includes('cancelled')) {
        set({ authError: 'Sign-in failed. Please try again.' })
      }
    }
  },

  signOut: async () => {
    set({ authError: null })
    try {
      await signOut()
      // onAuthStateChange handles the rest
    } catch {
      set({ authError: 'Sign-out failed. Please try again.' })
    }
  },

  clearAuthError: () => set({ authError: null }),
  dismissMigration: () => set({ migrationResult: null }),

  // ── Data actions ───────────────────────────────────────────────

  updateSettings: (settings) => {
    const current = get().data
    const updated: WallCalData = {
      ...current,
      settings: { ...current.settings, ...settings },
      updatedAt: Date.now(),
    }
    set({ data: updated })
    persistenceService.save(updated).catch((err) =>
      console.error('[WallCal] Failed to save settings:', err)
    )
  },

  updateDay: (key, entry) => {
    const current = get().data
    const existingDay = current.days[key]
    const updatedDay: DayEntry = {
      ...existingDay,
      ...entry,
      key,
      updatedAt: Date.now(),
    }
    const updated: WallCalData = {
      ...current,
      days: { ...current.days, [key]: updatedDay },
      updatedAt: Date.now(),
    }
    set({ data: updated })
    persistenceService.save(updated).catch((err) =>
      console.error('[WallCal] Failed to save day:', err)
    )
  },

  setMark: (dateKey, mark) => {
    const current = get().data
    const existingDay = current.days[dateKey]

    let updatedDays: Record<string, DayEntry>

    if (mark === null) {
      // Remove mark. If no other data on this day, prune the entry entirely.
      if (!existingDay) return
      const { mark: _removed, ...rest } = existingDay
      const hasOtherData = Object.keys(rest).filter((k) => k !== 'key' && k !== 'updatedAt').length > 0
      if (hasOtherData) {
        updatedDays = { ...current.days, [dateKey]: { ...rest, updatedAt: Date.now() } }
      } else {
        // Nothing left — remove the day entry completely
        const { [dateKey]: _, ...remaining } = current.days
        updatedDays = remaining
      }
    } else {
      // Set / update mark
      updatedDays = {
        ...current.days,
        [dateKey]: { ...existingDay, key: dateKey, mark, updatedAt: Date.now() },
      }
    }

    const updated: WallCalData = { ...current, days: updatedDays, updatedAt: Date.now() }
    set({ data: updated })
    persistenceService.save(updated).catch((err) =>
      console.error('[WallCal] Failed to save mark:', err)
    )
  },

  // ── Auth initialisation ────────────────────────────────────────
  // Called once from App.tsx on mount. Returns the Firebase unsubscribe fn.

  _initAuth: () => {
    let dataUnsub: (() => void) | null = null

    const authUnsub = onAuthStateChange(async (user) => {
      // Tear down previous data subscription
      dataUnsub?.()
      dataUnsub = null

      if (user) {
        // ── Authenticated ──────────────────────────────────────

        // 1. Attempt guest data migration BEFORE switching adapter
        let migrationResult: MigrationResult | null = null
        try {
          migrationResult = await persistenceService.migrateGuestToCloud(user.uid)
          if (migrationResult.status === 'empty') migrationResult = null
        } catch (err) {
          console.error('[WallCal] Migration failed (non-fatal):', err)
        }

        // 2. Switch adapter to Firestore
        persistenceService.useCloudMode(user.uid)

        // 3. Load initial data (or create it for new users)
        set({ isDataLoading: true, dataError: null })
        try {
          const loaded = await persistenceService.load()
          set({ data: loaded, isDataLoading: false })
          // For new users load() returns createEmptyData() because no Firestore
          // document exists yet. Save it immediately so the document is created.
          persistenceService.save(loaded).catch(() => {})
        } catch {
          set({ dataError: 'Failed to load your data. Using cached version.', isDataLoading: false })
        }

        // 4. Subscribe to real-time updates
        dataUnsub = persistenceService.subscribe((data) => {
          get()._setData(data)
        })

        set({
          authStatus: 'authenticated',
          user,
          migrationResult,
        })
      } else {
        // ── Guest ──────────────────────────────────────────────

        persistenceService.useGuestMode()

        set({ isDataLoading: true, dataError: null })
        try {
          const loaded = await persistenceService.load()
          set({ data: loaded, isDataLoading: false })
        } catch {
          set({ data: createEmptyData(), isDataLoading: false })
        }

        set({ authStatus: 'guest', user: null, migrationResult: null })
      }
    })

    return () => {
      authUnsub()
      dataUnsub?.()
    }
  },
}))
