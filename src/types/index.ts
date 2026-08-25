// Global application types for WallCal

/** Represents the current view/route in the app */
export type AppView = 'home' | 'calendar' | 'settings'

/** Generic status type for async operations */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

/** Generic key-value record */
export type StringRecord = Record<string, string>
