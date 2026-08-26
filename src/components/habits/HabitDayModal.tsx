import { useAppStore } from '@/store/useAppStore'

interface HabitDayModalProps {
  dateKey: string
  dateLabel: string
  onClose: () => void
}

export function HabitDayModal({ dateKey, dateLabel, onClose }: HabitDayModalProps) {
  // Read habits directly from store so checkbox toggles update immediately
  const habitsData = useAppStore((s) => s.data.habits)
  const habits = habitsData ?? []
  const toggleHabitCompletion = useAppStore((s) => s.toggleHabitCompletion)

  // Only habits that started on or before this date
  const scheduled = habits.filter((h) => h.startDate <= dateKey)

  function handleToggle(e: React.MouseEvent, habitId: string) {
    e.stopPropagation()
    toggleHabitCompletion(habitId, dateKey)
  }

  return (
    <>
      <div
        className="note-modal-backdrop"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Habits for ${dateLabel}`}
        className="task-list-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="note-modal-header">
          <div>
            <h2 className="note-modal-date">{dateLabel}</h2>
            <p className="note-modal-count">
              {scheduled.length === 0
                ? 'No habits scheduled'
                : `${scheduled.length} habit${scheduled.length > 1 ? 's' : ''} scheduled`}
            </p>
          </div>
          <button className="note-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {/* Habit toggle list */}
        <ul className="task-list" aria-label="Habits">
          {scheduled.length === 0 && (
            <li className="task-list-empty">
              <p>No habits are scheduled for this day yet.</p>
            </li>
          )}
          {scheduled.map((habit) => {
            const done = habit.completedDates.includes(dateKey)
            return (
              <li
                key={habit.id}
                className={`task-list-item${done ? ' task-list-item--completed' : ''}${habit.color ? ` task-list-item--color-${habit.color}` : ''}`}
              >
                <button
                  className={`task-check-btn${done ? ' task-check-btn--done' : ''}`}
                  onClick={(e) => handleToggle(e, habit.id)}
                  aria-label={done ? `Mark ${habit.name} incomplete` : `Mark ${habit.name} complete`}
                  title={done ? 'Mark incomplete' : 'Mark complete'}
                >
                  {done && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M1.5 5.5L3.5 7.5L8.5 2.5"
                        stroke="currentColor" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                <div className="task-list-content">
                  <span className="task-title">{habit.name}</span>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}
