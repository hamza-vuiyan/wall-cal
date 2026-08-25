import { useState } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { HomePage } from '@/pages/HomePage'
import { CalendarPage } from '@/pages/CalendarPage'
import { SettingsPage } from '@/pages/SettingsPage'
import type { AppView } from '@/types'

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home')

  const renderPage = () => {
    switch (currentView) {
      case 'calendar':
        return <CalendarPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <HomePage onNavigate={setCurrentView} />
    }
  }

  return (
    <>
      <Header currentView={currentView} onNavigate={setCurrentView} />
      {renderPage()}
      <Footer />
    </>
  )
}
