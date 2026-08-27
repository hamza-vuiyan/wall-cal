import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { MigrationBanner } from '@/components/auth/MigrationBanner'
import { OfflineBanner } from '@/components/OfflineBanner'
import { HomePage } from '@/pages/HomePage'
import { CalendarPage } from '@/pages/CalendarPage'
import { ChallengesPage } from '@/pages/ChallengesPage'
import { ChallengeDetailPage } from '@/pages/ChallengeDetailPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { useAppStore } from '@/store/useAppStore'
import type { AppView } from '@/types'

// ── Hash-based view routing ───────────────────────────────────────
const HASH_TO_VIEW: Record<string, AppView> = {
  '#calendar':   'calendar',
  '#settings':   'settings',
  '#home':       'home',
  '#challenges': 'challenges',
}

const VIEW_TO_HASH: Record<AppView, string> = {
  home:       '#home',
  calendar:   '#calendar',
  settings:   '#settings',
  challenges: '#challenges',
}

function getViewFromHash(): AppView {
  const hash = window.location.hash
  return HASH_TO_VIEW[hash] ?? 'home'
}

export default function App() {
  const [currentView, setCurrentViewState] = useState<AppView>(getViewFromHash)
  const [openChallengeId, setOpenChallengeId] = useState<string | null>(null)
  const initAuth = useAppStore((s) => s._initAuth)
  const setOnline = useAppStore((s) => s.setOnline)

  useEffect(() => {
    const cleanup = initAuth()
    return cleanup
  }, [initAuth])

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline])

  const navigateTo = useCallback((view: AppView) => {
    window.location.hash = VIEW_TO_HASH[view]
    setCurrentViewState(view)
    // Clear challenge detail when navigating away
    if (view !== 'challenges') setOpenChallengeId(null)
  }, [])

  useEffect(() => {
    function onHashChange() {
      setCurrentViewState(getViewFromHash())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const handleOpenChallenge = useCallback((id: string) => {
    setOpenChallengeId(id)
  }, [])

  const handleBackToChallenges = useCallback(() => {
    setOpenChallengeId(null)
  }, [])

  const renderPage = () => {
    switch (currentView) {
      case 'calendar':
        return <CalendarPage onNavigate={navigateTo} />
      case 'challenges':
        if (openChallengeId) {
          return (
            <ChallengeDetailPage
              challengeId={openChallengeId}
              onBack={handleBackToChallenges}
            />
          )
        }
        return <ChallengesPage onOpenChallenge={handleOpenChallenge} />
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
      <OfflineBanner />
    </>
  )
}
