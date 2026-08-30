import { useState, useEffect } from 'react'
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
  
  // Today's tasks
  const days = useAppStore((s) => s.data.days)
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
      
      setTodayStr(now.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }))
      
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const date = String(now.getDate()).padStart(2, '0')
      setTodayKey(`${year}-${month}-${date}`)
    }
    
    updateTime()
    // Update every minute to keep greeting/date fresh if page is left open
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])
  
  const todayTasks = todayKey ? (days[todayKey]?.tasks ?? []) : []
  const completedTasks = todayTasks.filter(t => t.completed).length

  return (
    <main id="main-content" className="flex flex-1 flex-col px-6 pt-8 pb-12 max-w-5xl mx-auto w-full">
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            {greeting}
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)]">
            Today · {todayStr}
          </p>
        </div>
        <button
          onClick={() => onNavigate('calendar')}
          className="px-4 py-2 bg-[var(--color-surface-raised)] border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] font-medium rounded-lg transition-colors text-sm flex items-center gap-2"
        >
          Open Calendar →
        </button>
      </header>
      
      <div className="dashboard-content grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 min-w-0">
          {/* Upcoming Countdowns */}
          <UpcomingCountdowns />
        </div>
        
        <div className="lg:col-span-1 min-w-0">
          
          {/* Today's Tasks */}
          <section aria-labelledby="today-tasks-heading">
            <div className="flex justify-between items-center mb-6">
              <h2 id="today-tasks-heading" className="text-sm font-bold tracking-widest text-[var(--color-text-secondary)] uppercase">
                Today's Tasks
              </h2>
              {todayTasks.length > 0 && (
                <span className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface-raised)] px-2 py-1 rounded-full border border-[var(--color-surface-border)]">
                  {completedTasks}/{todayTasks.length} Done
                </span>
              )}
            </div>
            
            <div className="bg-[var(--color-surface-raised)] border border-[var(--color-surface-border)] rounded-2xl p-6">
              {todayTasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[var(--color-text-secondary)] mb-4">No tasks scheduled for today</p>
                  <button 
                    className="text-sm font-medium text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)]"
                    onClick={() => setIsTasksOpen(true)}
                  >
                    + Add a task
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    {todayTasks.slice(0, 5).map(task => (
                      <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)]">
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${task.completed ? 'bg-[var(--color-brand-500)] border-[var(--color-brand-500)]' : 'border-[var(--color-text-secondary)]'}`} />
                        <span className={`text-sm ${task.completed ? 'line-through text-[var(--color-text-secondary)]' : 'text-[var(--color-text-primary)]'}`}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                    {todayTasks.length > 5 && (
                      <p className="text-xs text-[var(--color-text-secondary)] text-center mt-2">
                        + {todayTasks.length - 5} more tasks
                      </p>
                    )}
                  </div>
                  <button 
                    className="w-full py-2 text-sm font-medium bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-lg hover:border-[var(--color-brand-500)] transition-colors mt-2"
                    onClick={() => setIsTasksOpen(true)}
                  >
                    Manage Today's Tasks
                  </button>
                </div>
              )}
            </div>
          </section>
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
