import { useState } from 'react'
import type { Task } from '@/services/storage'
import { TaskEditorModal } from './TaskEditorModal'

interface TaskListModalProps {
  dateKey: string
  dateLabel: string
  tasks: Task[]
  onToggle: (taskId: string) => void
  onDelete: (taskId: string) => void
  onUpdate: (taskId: string, changes: Partial<Omit<Task, 'id' | 'date' | 'createdAt'>>) => void
  onAdd: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  onClose: () => void
}

export function TaskListModal({
  dateKey,
  dateLabel,
  tasks,
  onToggle,
  onDelete,
  onUpdate,
  onAdd,
  onClose,
}: TaskListModalProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Nested editor for adding
  if (showAdd) {
    return (
      <TaskEditorModal
        dateKey={dateKey}
        dateLabel={dateLabel}
        onSave={onAdd}
        onClose={() => setShowAdd(false)}
      />
    )
  }

  // Nested editor for editing
  if (editingTask) {
    return (
      <TaskEditorModal
        dateKey={dateKey}
        dateLabel={dateLabel}
        task={editingTask}
        onSave={(data) => onUpdate(editingTask.id, { ...data })}
        onClose={() => setEditingTask(null)}
      />
    )
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] animate-in fade-in duration-200"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Tasks for ${dateLabel}`}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[301] w-[92vw] sm:w-[480px] max-h-[85vh] overflow-y-auto bg-[var(--color-surface-raised)] border border-[var(--color-surface-border)] rounded-xl shadow-2xl p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-surface-border)] pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] m-0 tracking-tight font-display">
              {dateLabel} Tasks
            </h2>
            <p className="text-sm font-medium text-[var(--color-text-muted)] mt-1">
              {tasks.length === 0
                ? 'No tasks scheduled'
                : `${tasks.length} task${tasks.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[var(--color-brand-500)] text-[var(--color-surface-base)] rounded-lg hover:bg-[var(--color-brand-600)] transition-colors"
              onClick={() => setShowAdd(true)}
            >
              + Add
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-primary)] transition-colors"
              onClick={onClose}
              aria-label="Close tasks"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Task list */}
        <ul className="flex flex-col gap-3 m-0 p-0 list-none" aria-label="Tasks">
          {tasks.length === 0 && (
            <li className="flex flex-col items-center justify-center py-10 gap-4 text-center">
              <p className="text-[var(--color-text-muted)] text-base m-0">Nothing planned yet.</p>
              <button
                className="text-[var(--color-brand-400)] font-medium hover:underline"
                onClick={() => setShowAdd(true)}
              >
                Add your first task
              </button>
            </li>
          )}
          {tasks.map((task) => {
            const hasColor = Boolean(task.color)

            return (
              <li
                key={task.id}
                className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 group
                  ${task.completed ? 'bg-[var(--color-surface-base)] opacity-60 border-[var(--color-surface-border)]' : 'bg-[var(--color-surface-raised)] border-[var(--color-surface-border)] hover:border-[var(--color-brand-300)] shadow-sm'}`}
                style={hasColor && !task.completed ? { borderLeftColor: task.color?.startsWith('#') ? task.color : `var(--color-${task.color}-500, var(--color-brand-500))`, borderLeftWidth: '3px' } : undefined}
              >
                {/* Confirm delete overlay */}
                {confirmDeleteId === task.id && (
                  <div className="absolute inset-0 z-10 bg-[var(--color-surface-overlay)] backdrop-blur-[2px] rounded-xl flex items-center justify-center gap-3">
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">Delete?</span>
                    <button
                      className="px-3 py-1.5 text-xs font-semibold bg-[var(--color-destructive)] text-white rounded hover:opacity-90 transition-opacity"
                      onClick={() => {
                        onDelete(task.id)
                        setConfirmDeleteId(null)
                      }}
                    >
                      Delete
                    </button>
                    <button
                      className="px-3 py-1.5 text-xs font-semibold bg-[var(--color-surface-raised)] border border-[var(--color-surface-border)] text-[var(--color-text-primary)] rounded hover:bg-[var(--color-surface-hover)] transition-colors"
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Completion checkbox */}
                <button
                  className={`w-6 h-6 mt-0.5 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-500)]
                    ${task.completed ? 'bg-[var(--color-brand-500)] border-[var(--color-brand-500)] text-white' : 'bg-transparent border-[var(--color-text-muted)] hover:border-[var(--color-brand-400)]'}`}
                  onClick={() => onToggle(task.id)}
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed && (
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="animate-in zoom-in duration-200">
                      <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* Task content */}
                <div className={`flex flex-col flex-1 min-w-0 transition-opacity duration-200 ${task.completed ? 'opacity-80' : ''}`}>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-base font-medium leading-tight ${task.completed ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text-primary)]'}`}>
                      {task.title}
                    </span>
                    {task.time && (
                      <span className={`text-xs font-bold tracking-wider uppercase font-mono ${task.completed ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-brand-400)]'}`}>
                        {task.time}
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className={`mt-1.5 text-sm m-0 whitespace-pre-wrap break-words ${task.completed ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-secondary)]'}`}>
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Actions (visible on hover or focus-within) */}
                <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 flex items-center gap-1 transition-opacity duration-200">
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-text-muted)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-primary)] transition-colors focus:opacity-100"
                    onClick={() => setEditingTask(task)}
                    aria-label="Edit task"
                    title="Edit"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M9.5 1.5L12.5 4.5L4.5 12.5H1.5V9.5L9.5 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-500 transition-colors focus:opacity-100"
                    onClick={() => setConfirmDeleteId(task.id)}
                    aria-label="Delete task"
                    title="Delete"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M6 6.5v4M8 6.5v4M3 4l.8 7.2a.5.5 0 00.5.3h5.4a.5.5 0 00.5-.3L11 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}
