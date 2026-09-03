import { useState } from 'react'
import confetti from 'canvas-confetti'
import { useAppStore } from '@/store/useAppStore'
import {
  getChallengeStatus,
  getStatusLabel,
  getPercentage,
  getTotalDays,
  getCompletedCount,
  formatDateRange,
  formatShortDate,
  getDatesInRange,
} from '@/utils/challengeUtils'
import { ChallengeEditorModal } from '@/components/challenges/ChallengeEditorModal'

interface ChallengeDetailPageProps {
  challengeId: string
  onBack: () => void
}

export function ChallengeDetailPage({ challengeId, onBack }: ChallengeDetailPageProps) {
  const challengesData    = useAppStore((s) => s.data.challenges)
  const challenges        = challengesData ?? []
  const toggleDate        = useAppStore((s) => s.toggleChallengeDate)
  const updateChallenge   = useAppStore((s) => s.updateChallenge)
  const deleteChallenge   = useAppStore((s) => s.deleteChallenge)

  const [showEditor, setShowEditor]         = useState(false)
  const [confirmDelete, setConfirmDelete]   = useState(false)

  const challenge = challenges.find((c) => c.id === challengeId)

  if (!challenge) {
    return (
      <main className="challenges-page">
        <div className="challenges-wrapper">
          <p style={{ color: 'var(--color-text-muted)' }}>Challenge not found.</p>
          <button className="ch-back-btn" onClick={onBack}>← Back to Challenges</button>
        </div>
      </main>
    )
  }

  const status     = getChallengeStatus(challenge)
  const pct        = getPercentage(challenge)
  const total      = getTotalDays(challenge)
  const done       = getCompletedCount(challenge)
  const remaining  = total - done
  const allDates   = getDatesInRange(challenge.startDate, challenge.endDate)
  const today      = new Date().toISOString().slice(0, 10)

  const handleDelete = () => {
    deleteChallenge(challenge.id)
    onBack()
  }

  return (
    <main id="challenge-detail-page" className="challenges-page">
      <div className="challenges-wrapper">
        {/* Back + actions */}
        <div className="ch-detail-topbar">
          <button className="ch-back-btn" onClick={onBack}>
            ← Challenges
          </button>
          <div className="ch-detail-top-actions">
            <button
              className="note-action-btn note-action-btn--cancel"
              onClick={() => setShowEditor(true)}
            >
              Edit
            </button>
            <button
              className="note-icon-btn note-icon-btn--delete"
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete challenge"
              title="Delete challenge"
              style={{ width: 'auto', padding: '0.35rem 0.75rem', borderRadius: '0.4rem', fontSize: '0.8125rem', gap: '0.3rem', display: 'flex', alignItems: 'center' }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M6 6.5v4M8 6.5v4M3 4l.8 7.2a.5.5 0 00.5.3h5.4a.5.5 0 00.5-.3L11 4"
                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Delete
            </button>
          </div>
        </div>

        {/* Challenge header */}
        <div className={`ch-detail-header${challenge.color ? ` ch-detail-header--${challenge.color}` : ''}`}>
          <h1 className="ch-detail-name">{challenge.name}</h1>
          <p className="ch-detail-range">{formatDateRange(challenge)} · {total} days</p>
          {challenge.description && (
            <p className="ch-detail-desc">{challenge.description}</p>
          )}
          <span className={`ch-status-badge ch-status--${status} ch-status-badge--lg`}>
            {getStatusLabel(challenge)}
          </span>
        </div>

        {/* Progress summary */}
        <section className="ch-detail-progress-section">
          <h2 className="ch-detail-section-title">Progress</h2>
          <div className="ch-progress-track ch-progress-track--lg">
            <div
              className={`ch-progress-fill${challenge.color ? ` ch-progress-fill--${challenge.color}` : ''}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="ch-detail-stats-row">
            <div className="ch-stat">
              <span className="ch-stat-value">{done}</span>
              <span className="ch-stat-label">Completed</span>
            </div>
            <div className="ch-stat">
              <span className="ch-stat-value">{total}</span>
              <span className="ch-stat-label">Total</span>
            </div>
            <div className="ch-stat">
              <span className="ch-stat-value">{remaining}</span>
              <span className="ch-stat-label">To Do</span>
            </div>
            <div className="ch-stat ch-stat--highlight">
              <span className="ch-stat-value">{pct}%</span>
              <span className="ch-stat-label">Complete</span>
            </div>
          </div>
        </section>

        {/* Daily progress */}
        <section className="ch-detail-days-section">
          <h2 className="ch-detail-section-title">Daily Progress</h2>
          <ul className="ch-day-list">
            {allDates.map((dateKey) => {
              const isComplete = challenge.completedDates.includes(dateKey)
              const isToday    = dateKey === today
              const isFuture   = dateKey > today
              return (
                <li key={dateKey} className={`ch-day-item${isToday ? ' ch-day-item--today' : ''}${isFuture ? ' ch-day-item--future' : ''}`}>
                  <button
                    className={`task-check-btn${isComplete ? ' task-check-btn--done' : ''}`}
                    onClick={() => {
                      if (!isComplete) {
                        // Independent firecrackers exploding around the window
                        for (let i = 0; i < 10; i++) {
                          setTimeout(() => {
                            confetti({
                              particleCount: 50,
                              startVelocity: 25,
                              spread: 360,
                              ticks: 100,
                              origin: { 
                                x: 0.1 + Math.random() * 0.8, 
                                y: 0.1 + Math.random() * 0.6 
                              },
                              colors: ['#a3be8c', '#88c0d0', '#81a1c1', '#ebcb8b', '#b48ead'],
                              disableForReducedMotion: true,
                              zIndex: 1000,
                              scalar: 1.3
                            })
                          }, i * 180 + Math.random() * 100)
                        }
                      }
                      toggleDate(challenge.id, dateKey)
                    }}
                    aria-label={isComplete ? `Mark ${dateKey} incomplete` : `Mark ${dateKey} complete`}
                  >
                    {isComplete && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <path d="M1.5 5.5L3.5 7.5L8.5 2.5"
                          stroke="currentColor" strokeWidth="1.5"
                          strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span className={`ch-day-label${isComplete ? ' ch-day-label--done' : ''}${isFuture ? ' ch-day-label--future' : ''}`}>
                    {formatShortDate(dateKey)}
                    {isToday && <span className="ch-day-today-badge">Today</span>}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      {/* Edit modal */}
      {showEditor && (
        <ChallengeEditorModal
          challenge={challenge}
          onSave={(data) => updateChallenge(challenge.id, data)}
          onClose={() => setShowEditor(false)}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <>
          <div className="note-modal-backdrop" aria-hidden="true" onClick={() => setConfirmDelete(false)} />
          <div role="alertdialog" aria-modal="true" className="ch-confirm-dialog">
            <h3>Delete challenge?</h3>
            <p>This will permanently delete <strong>{challenge.name}</strong> and all its completion data.</p>
            <div className="task-form-actions" style={{ marginTop: '1rem' }}>
              <button
                className="note-action-btn note-action-btn--cancel"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
              <button
                className="note-add-btn"
                style={{ background: 'oklch(52% 0.22 20)', boxShadow: 'none' }}
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
