import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'

/**
 * Shown once after sign-in when guest data has been migrated to the cloud.
 * Auto-dismisses after 6 seconds.
 */
export function MigrationBanner() {
  const migrationResult = useAppStore((s) => s.migrationResult)
  const dismiss = useAppStore((s) => s.dismissMigration)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (migrationResult && (migrationResult.status === 'uploaded' || migrationResult.status === 'merged')) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(dismiss, 300) // wait for fade-out animation
      }, 6000)
      return () => clearTimeout(timer)
    }
  }, [migrationResult, dismiss])

  if (!migrationResult || !visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={['migration-banner', visible ? 'migration-banner--visible' : ''].join(' ')}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{migrationResult.message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(dismiss, 300) }}
        className="migration-banner-close"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  )
}
