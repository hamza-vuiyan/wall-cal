import { useState } from 'react'
import type { WishlistItem } from '@/services/storage'
import { WishlistEditorModal } from './WishlistEditorModal'

interface WishlistManagerModalProps {
  wishlistItems: WishlistItem[]
  onAdd: (data: Omit<WishlistItem, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'completedAt'>) => void
  onUpdate: (id: string, changes: Partial<Omit<WishlistItem, 'id' | 'createdAt'>>) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
  onClose: () => void
}

export function WishlistManagerModal({
  wishlistItems,
  onAdd,
  onUpdate,
  onDelete,
  onToggle,
  onClose,
}: WishlistManagerModalProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Sort items: incomplete first, then sort by newest
  const sorted = [...wishlistItems].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return b.createdAt - a.createdAt
  })

  return (
    <>
      <div className="note-modal-backdrop" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Wishlist"
        className="task-modal wishlist-manager-modal"
      >
        <div className="note-modal-header">
          <div>
            <h2 className="note-modal-date">Wishlist</h2>
            <p className="note-modal-count">
              {wishlistItems.length === 0
                ? 'Your list is empty'
                : `${wishlistItems.length} item${wishlistItems.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className="note-add-btn"
              onClick={() => setShowAdd(!showAdd)}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
            >
              {showAdd ? 'Cancel' : '+ New Wish'}
            </button>
            <button className="note-modal-close" onClick={onClose} aria-label="Close">×</button>
          </div>
        </div>

        {showAdd && (
          <WishlistEditorModal
            onSave={(data) => {
              onAdd(data)
              setShowAdd(false)
            }}
            onClose={() => setShowAdd(false)}
          />
        )}

        {editingItemId && (
          <WishlistEditorModal
            item={wishlistItems.find(i => i.id === editingItemId)}
            onSave={() => {}}
            onUpdate={(id, changes) => {
              onUpdate(id, changes)
              setEditingItemId(null)
            }}
            onClose={() => setEditingItemId(null)}
          />
        )}

        <div className="wishlist-grid" aria-label="Wishlist items">
          {wishlistItems.length === 0 && !showAdd && (
            <div className="habit-empty" style={{ gridColumn: '1 / -1' }}>
              <p>Start dreaming big.</p>
            </div>
          )}

          {sorted.map((item) => {
            const isConfirming = confirmDeleteId === item.id
            const colorClass = item.color ? ` habit-card--${item.color}` : ''
            return (
              <div
                key={item.id}
                className={`habit-card ${item.completed ? 'wishlist-card--completed' : ''}${colorClass}`}
              >
                {isConfirming && (
                  <div className="task-delete-confirm">
                    <span>Delete this item?</span>
                    <button
                      className="note-action-btn note-action-btn--save"
                      onClick={() => { onDelete(item.id); setConfirmDeleteId(null) }}
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

                {!isConfirming && (
                  <>
                    <div className="habit-card-main">
                      <div className="habit-card-title-row" style={{ alignItems: 'flex-start' }}>
                        <button
                          className={`task-check-btn ${item.completed ? 'task-check-btn--done' : ''}`}
                          onClick={() => onToggle(item.id)}
                          aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
                          title={item.completed ? 'Mark incomplete' : 'Mark complete'}
                          style={{ marginTop: '0.15rem' }}
                        >
                          {item.completed && (
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                              <path d="M13.5 4.5L6.5 11.5L2.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                        
                        <div className="imp-card-text">
                          <h3 className="wishlist-card-title" style={{ textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}>
                            {item.title}
                          </h3>
                          {item.description && (
                            <span className="wishlist-card-desc">{item.description}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="habit-card-actions">
                      {!item.completed && (
                        <button
                          className="note-icon-btn note-icon-btn--edit"
                          onClick={() => setEditingItemId(item.id)}
                          aria-label={`Edit ${item.title}`}
                          title="Edit"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M11 2l3 3-9 9H2v-3l9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      )}
                      <button
                        className="note-icon-btn note-icon-btn--delete"
                        onClick={() => setConfirmDeleteId(item.id)}
                        aria-label={`Delete ${item.title}`}
                        title="Delete"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M6 6.5v4M8 6.5v4M3 4l.8 7.2a.5.5 0 00.5.3h5.4a.5.5 0 00.5-.3L11 4"
                            stroke="currentColor" strokeWidth="1.4"
                            strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
