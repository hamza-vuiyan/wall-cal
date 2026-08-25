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
        className="note-modal-backdrop"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Tasks for ${dateLabel}`}
        className="task-list-modal"
      >
        {/* Header */}
        <div className="note-modal-header">
          <div>
            <h2 className="note-modal-date">{dateLabel}</h2>
            <p className="note-modal-count">
              {tasks.length === 0
                ? 'No tasks yet'
                : `${tasks.length} task${tasks.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className="note-add-btn"
              onClick={() => setShowAdd(true)}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
            >
              + Add task
            </button>
            <button
              className="note-modal-close"
              onClick={onClose}
              aria-label="Close tasks"
            >
              ×
            </button>
          </div>
        </div>

        {/* Task list */}
        <ul className="task-list" aria-label="Tasks">
          {tasks.length === 0 && (
            <li className="task-list-empty">
              <p>No tasks for this day.</p>
              <button
                className="note-add-btn"
                onClick={() => setShowAdd(true)}
              >
                + Add your first task
              </button>
            </li>
          )}
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`task-list-item${task.completed ? ' task-list-item--completed' : ''}${task.color ? ` task-list-item--color-${task.color}` : ''}`}
            >
              {/* Confirm delete overlay */}
              {confirmDeleteId === task.id && (
                <div className="task-delete-confirm">
                  <span>Delete this task?</span>
                  <button
                    className="note-action-btn note-action-btn--save"
                    onClick={() => {
                      onDelete(task.id)
                      setConfirmDeleteId(null)
                    }}
                  >
                    Delete
                  </button>
                  <button
                    className="note-action-btn note-action-btn--cancel"
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Completion checkbox */}
              <button
                className={`task-check-btn${task.completed ? ' task-check-btn--done' : ''}`}
                onClick={() => onToggle(task.id)}
                aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                title={task.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {task.completed && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M1.5 5.5L3.5 7.5L8.5 2.5"
                      stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {/* Task content */}
              <div className="task-list-content">
                {task.time && (
                  <span className="task-time">{task.time}</span>
                )}
                <span className="task-title">{task.title}</span>
                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="task-list-actions">
                <button
                  className="note-icon-btn"
                  onClick={() => setEditingTask(task)}
                  aria-label="Edit task"
                  title="Edit"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M9.5 1.5L12.5 4.5L4.5 12.5H1.5V9.5L9.5 1.5Z"
                      stroke="currentColor" strokeWidth="1.4"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  className="note-icon-btn note-icon-btn--delete"
                  onClick={() => setConfirmDeleteId(task.id)}
                  aria-label="Delete task"
                  title="Delete"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M6 6.5v4M8 6.5v4M3 4l.8 7.2a.5.5 0 00.5.3h5.4a.5.5 0 00.5-.3L11 4"
                      stroke="currentColor" strokeWidth="1.4"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
