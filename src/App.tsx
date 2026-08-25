import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { MigrationBanner } from '@/components/auth/MigrationBanner'
import { HomePage } from '@/pages/HomePage'
import { CalendarPage } from '@/pages/CalendarPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { useAppStore } from '@/store/useAppStore'
import type { AppView } from '@/types'

// ── Hash-based view routing ───────────────────────────────────────
// Maps URL hash → AppView so refresh / browser back-forward work.
// e.g. http://localhost:5173/#calendar stays on the calendar after refresh.

const HASH_TO_VIEW: Record<string, AppView> = {
  '#calendar': 'calendar',
  '#settings': 'settings',
  '#home': 'home',
}

const VIEW_TO_HASH: Record<AppView, string> = {
  home: '#home',
  calendar: '#calendar',
  settings: '#settings',
}

function getViewFromHash(): AppView {
  const hash = window.location.hash
  return HASH_TO_VIEW[hash] ?? 'home'
}

export default function App() {
  const [currentView, setCurrentViewState] = useState<AppView>(getViewFromHash)
  const initAuth = useAppStore((s) => s._initAuth)

  // Wire Firebase auth listener once on mount.
  useEffect(() => {
    const cleanup = initAuth()
    return cleanup
  }, [initAuth])

  // Keep URL hash in sync when view changes
  const navigateTo = useCallback((view: AppView) => {
    window.location.hash = VIEW_TO_HASH[view]
    setCurrentViewState(view)
  }, [])

  // Sync view if user manually changes the hash or uses browser back/forward
  useEffect(() => {
    function onHashChange() {
      setCurrentViewState(getViewFromHash())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const renderPage = () => {
    switch (currentView) {
      case 'calendar':
        return <CalendarPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <HomePage onNavigate={navigateTo} />
    }
  }

  return (
    <>
      <Header currentView={currentView} onNavigate={navigateTo} />
      <MigrationBanner />
      {renderPage()}
      <Footer />
    </>
  )
}
