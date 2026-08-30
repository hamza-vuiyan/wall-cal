import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { CountdownCard } from './CountdownCard'
import { ImportantDateEditorModal } from '@/components/importantdates/ImportantDateEditorModal'
import type { ImportantDate } from '@/services/storage'

export function UpcomingCountdowns() {
  const importantDates = useAppStore((s) => s.data.importantDates) ?? []
  const addImportantDate = useAppStore((s) => s.addImportantDate)
  const updateImportantDate = useAppStore((s) => s.updateImportantDate)
  
  const [editingDate, setEditingDate] = useState<ImportantDate | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  
  // Filter out events that are fully in the past (yesterday or older)
  // We keep events that are "Today" even if their time has passed, so the user sees "🎉 Today!"
  const upcoming = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10)
    
    const valid = importantDates.filter(d => d.date >= todayStr)
    
    // Sort chronologically
    valid.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      if (a.time && b.time) return a.time.localeCompare(b.time)
      if (a.time) return -1
      if (b.time) return 1
      return 0
    })
    
    // Take top 5
    return valid.slice(0, 5)
  }, [importantDates])

  const handleSave = (data: Omit<ImportantDate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingDate) {
      updateImportantDate(editingDate.id, data)
    } else {
      addImportantDate(data)
    }
  }

  return (
    <section className="upcoming-section" aria-labelledby="upcoming-heading">
      <div className="upcoming-header">
        <h2 id="upcoming-heading" className="upcoming-title">UPCOMING</h2>
        <button 
          className="upcoming-add-btn"
          onClick={() => setIsAdding(true)}
          aria-label="Add important date"
        >
          + Add
        </button>
      </div>
      
      {upcoming.length === 0 ? (
        <div className="upcoming-empty">
          <p>No upcoming countdowns</p>
          <button 
            className="upcoming-empty-btn"
            onClick={() => setIsAdding(true)}
          >
            Add an important date to start counting down
          </button>
        </div>
      ) : (
        <div className="upcoming-cards-container">
          <div className="upcoming-cards-scroll">
            {upcoming.map(date => (
              <CountdownCard 
                key={date.id} 
                importantDate={date} 
                onClick={() => setEditingDate(date)} 
              />
            ))}
          </div>
        </div>
      )}
      
      {(isAdding || editingDate) && (
        <ImportantDateEditorModal
          importantDate={editingDate || undefined}
          onSave={handleSave}
          onClose={() => {
            setIsAdding(false)
            setEditingDate(null)
          }}
        />
      )}
    </section>
  )
}
