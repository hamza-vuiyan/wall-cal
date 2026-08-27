import { useAppStore } from '@/store/useAppStore'

export function OfflineBanner() {
  const isOnline = useAppStore((s) => s.isOnline)
  const cloudSyncError = useAppStore((s) => s.cloudSyncError)
  const authStatus = useAppStore((s) => s.authStatus)

  if (isOnline && !cloudSyncError) return null

  let message: string
  if (!isOnline) {
    message =
      authStatus === 'authenticated'
        ? "You're offline — your changes will sync when you reconnect."
        : "You're offline — changes are saved on this device."
  } else {
    message = 'Cloud sync unavailable — retrying in the background.'
  }

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-[var(--color-surface-raised)] px-4 py-2 text-sm text-[var(--color-text-muted)] shadow-lg"
    >
      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-amber-400 align-middle" />
      {message}
    </div>
  )
}
