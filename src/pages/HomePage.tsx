import { useState, useEffect, useMemo } from 'react'
import type { AppView } from '@/types'
import { UpcomingCountdowns } from '@/components/home/UpcomingCountdowns'
import { useAppStore } from '@/store/useAppStore'
import { TaskListModal } from '@/components/calendar/TaskListModal'

interface HomePageProps {
  onNavigate: (view: AppView) => void
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [greeting, setGreeting] = useState('Good morning')
  const [todayStr, setTodayStr] = useState('')
  const [todayKey, setTodayKey] = useState('')
  
  const days = useAppStore((s) => s.data.days)
  const challenges = useAppStore((s) => s.data.challenges) ?? []
  
  const toggleTask = useAppStore((s) => s.toggleTask)
  const deleteTask = useAppStore((s) => s.deleteTask)
  const updateTask = useAppStore((s) => s.updateTask)
  const addTask = useAppStore((s) => s.addTask)
  
  const [isTasksOpen, setIsTasksOpen] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hour = now.getHours()
      
      if (hour < 12) setGreeting('Good morning')
      else if (hour < 17) setGreeting('Good afternoon')
      else setGreeting('Good evening')
      
      setTodayStr(now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }))
      
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const date = String(now.getDate()).padStart(2, '0')
      setTodayKey(`${year}-${month}-${date}`)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])
  
  const todayTasks = todayKey ? (days[todayKey]?.tasks ?? []) : []
  const todayNotes = todayKey ? (days[todayKey]?.notes ?? []) : []
  const completedTasks = todayTasks.filter(t => t.completed).length

  const activeChallenges = useMemo(() => {
    return challenges.filter(c => c.endDate >= todayKey)
  }, [challenges, todayKey])

  return (
    <main id="main-content" className="flex flex-1 flex-col px-6 pt-12 pb-12 max-w-4xl mx-auto w-full">
      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)] mb-2 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {greeting}.
        </h1>
        <p className="text-xl text-[var(--color-text-secondary)] font-medium">
          It's {todayStr}.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
        {/* Left Column: Today's Focus */}
        <div className="flex flex-col gap-10">
          
          {/* Today's Tasks */}
          <section aria-labelledby="home-tasks-heading">
            <header className="flex justify-between items-end mb-4">
              <h2 id="home-tasks-heading" className="text-sm font-bold tracking-widest text-[var(--color-text-secondary)] uppercase">
                Today's Tasks
              </h2>
              {todayTasks.length > 0 && (
                <span className="text-xs font-medium text-[var(--color-text-muted)]">
                  {completedTasks}/{todayTasks.length} done
                </span>
              )}
            </header>
            
            {todayTasks.length === 0 ? (
              <div className="py-6 border-l-2 border-[var(--color-surface-border)] pl-4">
                <p className="text-[var(--color-text-secondary)] italic mb-3">Nothing planned yet.</p>
                <button 
                  className="text-sm font-medium text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] transition-colors"
                  onClick={() => setIsTasksOpen(true)}
                >
                  + Add a task
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {todayTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="group flex items-start gap-3 cursor-pointer" onClick={() => setIsTasksOpen(true)}>
                    <div className={`mt-1 w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${task.completed ? 'bg-[var(--color-brand-500)] border-[var(--color-brand-500)]' : 'border-[var(--color-text-muted)] group-hover:border-[var(--color-text-secondary)]'}`} />
                    <span className={`text-base leading-snug transition-colors ${task.completed ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-100)]'}`}>
                      {task.title}
                    </span>
                  </div>
                ))}
                {todayTasks.length > 5 && (
                  <button className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-left mt-2 pl-7" onClick={() => setIsTasksOpen(true)}>
                    + {todayTasks.length - 5} more
                  </button>
                )}
                {todayTasks.length > 0 && todayTasks.length <= 5 && (
                  <button className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand-400)] text-left mt-2 pl-7 transition-colors" onClick={() => setIsTasksOpen(true)}>
                    + Add a task
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Today's Notes (Only show if there are notes) */}
          {todayNotes.length > 0 && (
            <section aria-labelledby="home-notes-heading">
              <header className="mb-4">
                <h2 id="home-notes-heading" className="text-sm font-bold tracking-widest text-[var(--color-text-secondary)] uppercase">
                  Today's Notes
                </h2>
              </header>
              <div className="flex flex-col gap-3 pl-4 border-l-2 border-[var(--color-surface-border)]">
                {todayNotes.slice(0, 3).map(note => (
                  <div key={note.id} className="flex gap-3">
                    <span className="text-[var(--color-text-muted)] select-none">—</span>
                    <p className="text-base text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed flex-1">
                      {note.text}
                    </p>
                  </div>
                ))}
                {todayNotes.length > 3 && (
                  <p className="text-sm text-[var(--color-text-muted)] pl-6">
                    + {todayNotes.length - 3} more notes on calendar
                  </p>
                )}
              </div>
            </section>
          )}

        </div>
        
        {/* Right Column: Broader context */}
        <div className="flex flex-col gap-10">
          
          {/* Active Challenges */}
          <section aria-labelledby="home-challenges-heading">
            <header className="flex justify-between items-end mb-4">
              <h2 id="home-challenges-heading" className="text-sm font-bold tracking-widest text-[var(--color-text-secondary)] uppercase">
                Active Challenges
              </h2>
            </header>
            
            {activeChallenges.length === 0 ? (
              <div className="py-6 border-l-2 border-[var(--color-surface-border)] pl-4">
                <p className="text-[var(--color-text-secondary)] italic mb-3">Ready for a challenge?</p>
                <button 
                  className="text-sm font-medium text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] transition-colors"
                  onClick={() => onNavigate('challenges')}
                >
                  Explore challenges →
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-5 border-l-2 border-[var(--color-surface-border)] pl-4">
                {activeChallenges.slice(0, 3).map(challenge => {
                  const targetDays = Math.max(1, Math.ceil((new Date(challenge.endDate).getTime() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)
                  const progress = Math.min(100, Math.round((challenge.completedDates.length / targetDays) * 100))
                  return (
                    <div 
                      key={challenge.id}
                      className="group cursor-pointer flex flex-col gap-1.5"
                      onClick={() => onNavigate('challenges')}
                    >
                      <div className="flex justify-between items-baseline gap-4">
                        <h3 className="text-base font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-300)] transition-colors truncate">
                          {challenge.name}
                        </h3>
                        <span className="text-sm text-[var(--color-text-muted)] flex-shrink-0">{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[var(--color-surface-raised)] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[var(--color-brand-500)] rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Upcoming Countdowns */}
          <UpcomingCountdowns />
          
        </div>
      </div>
      
      {isTasksOpen && (
        <TaskListModal 
          dateKey={todayKey}
          dateLabel={`Today, ${todayStr}`}
          tasks={todayTasks}
          onToggle={(id) => toggleTask(todayKey, id)}
          onDelete={(id) => deleteTask(todayKey, id)}
          onUpdate={(id, changes) => updateTask(todayKey, id, changes)}
          onAdd={(data) => addTask(todayKey, data as any)}
          onClose={() => setIsTasksOpen(false)}
        />
      )}
    </main>
  )
}
