import { create } from 'zustand'
import type { User } from 'firebase/auth'
import { signInWithGoogle, signOut, onAuthStateChange } from '@/services/auth'
import { persistenceService } from '@/services/storage'
import type { WallCalData, DayEntry, UserSettings, MigrationResult, MarkType, Note, DayColor, Task, Challenge, Habit } from '@/services/storage'
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
  /** Add a new note to a date. Returns the generated note ID. */
  addNote: (dateKey: string, text: string) => string
  /** Update the text of an existing note. */
  updateNote: (dateKey: string, noteId: string, text: string) => void
  /** Delete a note from a date. */
  deleteNote: (dateKey: string, noteId: string) => void
  /** Set or remove the highlight colour on a date. Pass null to clear. */
  setDayColor: (dateKey: string, color: DayColor | null) => void
  /** Reorder notes on a date by moving fromIndex to toIndex. */
  reorderNotes: (dateKey: string, fromIndex: number, toIndex: number) => void
  /** Add a new task to a date. Returns the generated task ID. */
  addTask: (dateKey: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => string
  /** Update fields of an existing task. */
  updateTask: (dateKey: string, taskId: string, changes: Partial<Omit<Task, 'id' | 'date' | 'createdAt'>>) => void
  /** Toggle a task's completed status. */
  toggleTask: (dateKey: string, taskId: string) => void
  /** Delete a task from a date. */
  deleteTask: (dateKey: string, taskId: string) => void
  /** Add a new challenge. Returns the generated challenge ID. */
  addChallenge: (data: Omit<Challenge, 'id' | 'completedDates' | 'createdAt' | 'updatedAt'>) => string
  /** Update fields of an existing challenge. */
  updateChallenge: (id: string, changes: Partial<Omit<Challenge, 'id' | 'createdAt' | 'completedDates'>>) => void
  /** Delete a challenge and all its completion data. */
  deleteChallenge: (id: string) => void
  /** Toggle completion of a specific date within a challenge. */
  toggleChallengeDate: (challengeId: string, dateKey: string) => void

  // Actions — Habits
  /** Add a new habit. Returns the generated habit ID. */
  addHabit: (data: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'completedDates'>) => string
  /** Update fields of an existing habit. */
  updateHabit: (id: string, changes: Partial<Omit<Habit, 'id' | 'createdAt'>>) => void
  /** Delete a habit and all its completion data. */
  deleteHabit: (id: string) => void
  /** Toggle completion of a habit for a specific date. */
  toggleHabitCompletion: (habitId: string, dateKey: string) => void

  // Internal
  _setData: (data: WallCalData) => void
  _initAuth: () => () => void
}

// ── Helpers ───────────────────────────────────────────────────────

/** Sorts tasks: timed tasks ascending by time, then untimed tasks by createdAt */
function sortTasks(a: Task, b: Task): number {
  if (a.time && b.time) return a.time.localeCompare(b.time)
  if (a.time && !b.time) return -1
  if (!a.time && b.time) return 1
  return a.createdAt - b.createdAt
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

  addNote: (dateKey, text) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
    const now = Date.now()
    const newNote: Note = { id, text: text.trim(), createdAt: now, updatedAt: now }
    const current = get().data
    const existing = current.days[dateKey]
    const updated: WallCalData = {
      ...current,
      days: {
        ...current.days,
        [dateKey]: {
          ...existing,
          key: dateKey,
          notes: [...(existing?.notes ?? []), newNote],
          updatedAt: now,
        },
      },
      updatedAt: now,
    }
    set({ data: updated })
    persistenceService.save(updated).catch((err) =>
      console.error('[WallCal] Failed to save note:', err)
    )
    return id
  },

  updateNote: (dateKey, noteId, text) => {
    const current = get().data
    const existing = current.days[dateKey]
    if (!existing?.notes) return
    const now = Date.now()
    const updated: WallCalData = {
      ...current,
      days: {
        ...current.days,
        [dateKey]: {
          ...existing,
          notes: existing.notes.map((n) =>
            n.id === noteId ? { ...n, text: text.trim(), updatedAt: now } : n
          ),
          updatedAt: now,
        },
      },
      updatedAt: now,
    }
    set({ data: updated })
    persistenceService.save(updated).catch((err) =>
      console.error('[WallCal] Failed to update note:', err)
    )
  },

  deleteNote: (dateKey, noteId) => {
    const current = get().data
    const existing = current.days[dateKey]
    if (!existing) return
    const now = Date.now()
    const remainingNotes = (existing.notes ?? []).filter((n) => n.id !== noteId)
    let updatedDays: Record<string, DayEntry>
    // Prune day entry if no mark and no notes remain
    if (remainingNotes.length === 0 && !existing.mark) {
      const { [dateKey]: _, ...rest } = current.days
      updatedDays = rest
    } else {
      updatedDays = {
        ...current.days,
        [dateKey]: { ...existing, notes: remainingNotes.length ? remainingNotes : undefined, updatedAt: now },
      }
    }
    const updated: WallCalData = { ...current, days: updatedDays, updatedAt: now }
    set({ data: updated })
    persistenceService.save(updated).catch((err) =>
      console.error('[WallCal] Failed to delete note:', err)
    )
  },

  setDayColor: (dateKey, color) => {
    const current = get().data
    const existing = current.days[dateKey]
    const now = Date.now()
    let updatedDays: Record<string, DayEntry>

    if (color === null) {
      if (!existing) return
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { color: _removed, ...rest } = existing
      const hasOtherData = rest.mark || (rest.notes?.length ?? 0) > 0
      if (!hasOtherData) {
        const { [dateKey]: _, ...remaining } = current.days
        updatedDays = remaining
      } else {
        updatedDays = { ...current.days, [dateKey]: { ...rest, updatedAt: now } }
      }
    } else {
      updatedDays = {
        ...current.days,
        [dateKey]: { ...existing, key: dateKey, color, updatedAt: now },
      }
    }

    const updated: WallCalData = { ...current, days: updatedDays, updatedAt: now }
    set({ data: updated })
    persistenceService.save(updated).catch((err) =>
      console.error('[WallCal] Failed to save colour:', err)
    )
  },

  reorderNotes: (dateKey, fromIndex, toIndex) => {
    const current = get().data
    const existing = current.days[dateKey]
    if (!existing?.notes || fromIndex === toIndex) return
    const now = Date.now()
    const reordered = [...existing.notes]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    const updated: WallCalData = {
      ...current,
      days: {
        ...current.days,
        [dateKey]: { ...existing, notes: reordered, updatedAt: now },
      },
      updatedAt: now,
    }
    set({ data: updated })
    persistenceService.save(updated).catch((err) =>
      console.error('[WallCal] Failed to reorder notes:', err)
    )
  },

  // ── Task actions ───────────────────────────────────────────

  addTask: (dateKey, taskData) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
    const now = Date.now()
    const newTask: Task = { ...taskData, id, date: dateKey, createdAt: now, updatedAt: now }
    const current = get().data
    const existing = current.days[dateKey]
    // Sort by time after adding: timed tasks first (ascending), then untimed
    const allTasks = [...(existing?.tasks ?? []), newTask].sort(sortTasks)
    const updated: WallCalData = {
      ...current,
      days: {
        ...current.days,
        [dateKey]: { ...existing, key: dateKey, tasks: allTasks, updatedAt: now },
      },
      updatedAt: now,
    }
    set({ data: updated })
    persistenceService.save(updated).catch((err) =>
      console.error('[WallCal] Failed to save task:', err)
    )
    return id
  },

  updateTask: (dateKey, taskId, changes) => {
    const current = get().data
    const existing = current.days[dateKey]
    if (!existing?.tasks) return
    const now = Date.now()
    const updatedTasks = existing.tasks
      .map((t) => t.id === taskId ? { ...t, ...changes, updatedAt: now } : t)
      .sort(sortTasks)
    const updated: WallCalData = {
      ...current,
      days: {
        ...current.days,
        [dateKey]: { ...existing, tasks: updatedTasks, updatedAt: now },
      },
      updatedAt: now,
    }
    set({ data: updated })
    persistenceService.save(updated).catch((err) =>
      console.error('[WallCal] Failed to update task:', err)
    )
  },

  toggleTask: (dateKey, taskId) => {
    const current = get().data
    const existing = current.days[dateKey]
    if (!existing?.tasks) return
    const now = Date.now()
    const updatedTasks = existing.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed, updatedAt: now } : t
    )
    const updated: WallCalData = {
      ...current,
      days: {
        ...current.days,
        [dateKey]: { ...existing, tasks: updatedTasks, updatedAt: now },
      },
      updatedAt: now,
    }
    set({ data: updated })
    persistenceService.save(updated).catch((err) =>
      console.error('[WallCal] Failed to toggle task:', err)
    )
  },

  deleteTask: (dateKey, taskId) => {
    const current = get().data
    const existing = current.days[dateKey]
    if (!existing) return
    const now = Date.now()
    const remaining = (existing.tasks ?? []).filter((t) => t.id !== taskId)
    // Prune day entry if completely empty
    const isEmpty = remaining.length === 0 && !existing.mark && !existing.notes?.length && !existing.color
    let updatedDays: Record<string, DayEntry>
    if (isEmpty) {
      const { [dateKey]: _, ...rest } = current.days
      updatedDays = rest
    } else {
      updatedDays = {
        ...current.days,
        [dateKey]: { ...existing, tasks: remaining.length ? remaining : undefined, updatedAt: now },
      }
    }
    const updated: WallCalData = { ...current, days: updatedDays, updatedAt: now }
    set({ data: updated })
    persistenceService.save(updated).catch((err) =>
      console.error('[WallCal] Failed to delete task:', err)
    )
  },

  // ── Challenge actions ─────────────────────────────────────────

  addChallenge: (data) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
    const now = Date.now()
    const newChallenge: Challenge = { ...data, id, completedDates: [], createdAt: now, updatedAt: now }
    const current = get().data
    const updated: WallCalData = {
      ...current,
      challenges: [...(current.challenges ?? []), newChallenge],
      updatedAt: now,
    }
    set({ data: updated })
    persistenceService.save(updated).catch((err) =>
      console.error('[WallCal] Failed to save challenge:', err)
    )
    return id
  },

  updateChallenge: (id, changes) => {
    const current = get().data
    const now = Date.now()
    const updated: WallCalData = {
      ...current,
      challenges: (current.challenges ?? []).map((c) =>
        c.id === id ? { ...c, ...changes, updatedAt: now } : c
      ),
      updatedAt: now,
    }
    set({ data: updated })
    persistenceService.save(updated).catch((err) =>
      console.error('[WallCal] Failed to update challenge:', err)
    )
  },

  deleteChallenge: (id) => {
    const current = get().data
    const now = Date.now()
    const updated: WallCalData = {
      ...current,
      challenges: (current.challenges ?? []).filter((c) => c.id !== id),
      updatedAt: now,
    }
    set({ data: updated })
    persistenceService.save(updated).catch((err) =>
      console.error('[WallCal] Failed to delete challenge:', err)
    )
  },

  toggleChallengeDate: (challengeId, dateKey) => {
    const current = get().data
    const now = Date.now()
    const updated: WallCalData = {
      ...current,
      challenges: (current.challenges ?? []).map((c) => {
        if (c.id !== challengeId) return c
        const isComplete = c.completedDates.includes(dateKey)
        return {
          ...c,
          completedDates: isComplete
            ? c.completedDates.filter((d) => d !== dateKey)
            : [...c.completedDates, dateKey].sort(),
          updatedAt: now,
        }
      }),
      updatedAt: now,
    }
    set({ data: updated })
    persistenceService.save(updated).catch((err) =>
      console.error('[WallCal] Failed to toggle challenge date:', err)
    )
  },

  // ── Habit actions ───────────────────────────────────────────

  addHabit: (data) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
    const now = Date.now()
    const newHabit: Habit = { ...data, id, completedDates: [], createdAt: now, updatedAt: now }
    const current = get().data
    const updated: WallCalData = {
      ...current,
      habits: [...(current.habits ?? []), newHabit],
      updatedAt: now,
    }
    set({ data: updated })
    persistenceService.save(updated).catch((err) =>
      console.error('[WallCal] Failed to save habit:', err)
    )
    return id
  },

  updateHabit: (id, changes) => {
    const current = get().data
    const now = Date.now()
    const updated: WallCalData = {
      ...current,
      habits: (current.habits ?? []).map((h) =>
        h.id === id ? { ...h, ...changes, updatedAt: now } : h
      ),
      updatedAt: now,
    }
    set({ data: updated })
    persistenceService.save(updated).catch((err) =>
      console.error('[WallCal] Failed to update habit:', err)
    )
  },

  deleteHabit: (id) => {
    const current = get().data
    const now = Date.now()
    const updated: WallCalData = {
      ...current,
      habits: (current.habits ?? []).filter((h) => h.id !== id),
      updatedAt: now,
    }
    set({ data: updated })
    persistenceService.save(updated).catch((err) =>
      console.error('[WallCal] Failed to delete habit:', err)
    )
  },

  toggleHabitCompletion: (habitId, dateKey) => {
    const current = get().data
    const now = Date.now()
    const updated: WallCalData = {
      ...current,
      habits: (current.habits ?? []).map((h) => {
        if (h.id !== habitId) return h
        const isComplete = h.completedDates.includes(dateKey)
        return {
          ...h,
          completedDates: isComplete
            ? h.completedDates.filter((d) => d !== dateKey)
            : [...h.completedDates, dateKey].sort(),
          updatedAt: now,
        }
      }),
      updatedAt: now,
    }
    set({ data: updated })
    persistenceService.save(updated).catch((err) =>
      console.error('[WallCal] Failed to toggle habit completion:', err)
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
        dataUnsub = persistenceService.subscribe((incoming) => {
          // Preserve in-memory fields that may not yet be in Firestore
          // (e.g., challenges written before the schema fix)
          const current = get().data
          const merged: WallCalData = {
            ...incoming,
            challenges: incoming.challenges ?? current.challenges,
            habits: incoming.habits ?? current.habits,
          }
          get()._setData(merged)
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
