import { useState, useMemo } from 'react'
import { toLocalDateKey } from '@/utils/dateUtils'
import { useAppStore } from '@/store/useAppStore'
import { ImportantDateEditorModal } from '@/components/importantdates/ImportantDateEditorModal'
import type { ImportantDate } from '@/services/storage'

export function UpcomingCountdowns() {
  const importantDates = useAppStore((s) => s.data.importantDates) ?? []
  const addImportantDate = useAppStore((s) => s.addImportantDate)
  const updateImportantDate = useAppStore((s) => s.updateImportantDate)
  
  const [editingDate, setEditingDate] = useState<ImportantDate | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  
  const upcoming = useMemo(() => {
    const todayStr = toLocalDateKey()
    const valid = importantDates.filter(d => d.date >= todayStr)
    
    valid.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      if (a.time && b.time) return a.time.localeCompare(b.time)
      if (a.time) return -1
      if (b.time) return 1
      return 0
    })
    
    return valid.slice(0, 3)
  }, [importantDates])

  const handleSave = (data: Omit<ImportantDate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingDate) {
      updateImportantDate(editingDate.id, data)
    } else {
      addImportantDate(data)
    }
  }

  return (
    <section aria-labelledby="home-upcoming-heading">
      <header className="flex justify-between items-end mb-4">
        <h2 id="home-upcoming-heading" className="text-sm font-bold tracking-widest text-[var(--color-text-secondary)] uppercase">
          Upcoming
        </h2>
      </header>
      
      {upcoming.length === 0 ? (
        <div className="py-6 border-l-2 border-[var(--color-surface-border)] pl-4">
          <p className="text-[var(--color-text-secondary)] italic mb-3">No upcoming events.</p>
          <button 
            className="text-sm font-medium text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] transition-colors"
            onClick={() => setIsAdding(true)}
          >
            + Add an important date
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5 border-l-2 border-[var(--color-surface-border)] pl-4">
          {upcoming.map(date => {
            // Calculate days left
            const today = new Date(toLocalDateKey())
            const target = new Date(date.date)
            const diffTime = target.getTime() - today.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            
            const isToday = diffDays === 0
            
            return (
              <div 
                key={date.id} 
                className="group cursor-pointer flex flex-col gap-1"
                onClick={() => setEditingDate(date)} 
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-300)] transition-colors">
                    {date.title}
                  </span>
                  {date.category && (
                    <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)]">
                      {date.category}
                    </span>
                  )}
                </div>
                <div className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                  <span className={isToday ? 'text-[var(--color-brand-400)] font-medium' : ''}>
                    {isToday ? 'Today!' : `${diffDays} day${diffDays === 1 ? '' : 's'} left`}
                  </span>
                  <span>·</span>
                  <span>{new Date(date.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            )
          })}
          <button 
            className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-brand-400)] text-left mt-2 transition-colors"
            onClick={() => setIsAdding(true)}
          >
            + Add an important date
          </button>
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
