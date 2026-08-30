import { useEffect, useState, useCallback, useRef, useLayoutEffect } from 'react'
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

import { BottomNav } from '@/components/BottomNav'

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

const scrollPositions: Partial<Record<AppView, number>> = {}

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

  const currentViewRef = useRef(currentView)
  useEffect(() => {
    currentViewRef.current = currentView
  }, [currentView])

  const navigateTo = useCallback((view: AppView) => {
    window.location.hash = VIEW_TO_HASH[view]
  }, [])

  useEffect(() => {
    function onHashChange() {
      scrollPositions[currentViewRef.current] = window.scrollY
      const nextView = getViewFromHash()
      setCurrentViewState(nextView)
      if (nextView !== 'challenges') setOpenChallengeId(null)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useLayoutEffect(() => {
    // Restore scroll position synchronously before paint to prevent flashing
    window.scrollTo({
      top: scrollPositions[currentView] || 0,
      behavior: 'instant'
    })
  }, [currentView])

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
      <main className="animate-in fade-in duration-300 flex-1 flex flex-col">
        {renderPage()}
      </main>
      <Footer />
      <OfflineBanner />
      <BottomNav currentView={currentView} onNavigate={navigateTo} />
    </>
  )
}
