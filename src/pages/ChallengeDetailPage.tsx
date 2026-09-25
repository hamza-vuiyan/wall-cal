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
import { toLocalDateKey } from '@/utils/dateUtils'
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
      <main className="flex flex-col items-center py-20">
        <p className="text-[var(--color-text-muted)] mb-4">Challenge not found.</p>
        <button className="text-[var(--color-brand-400)] hover:underline" onClick={onBack}>← Back to Challenges</button>
      </main>
    )
  }

  const status     = getChallengeStatus(challenge)
  const pct        = getPercentage(challenge)
  const total      = getTotalDays(challenge)
  const done       = getCompletedCount(challenge)
  const remaining  = total - done
  const allDates   = getDatesInRange(challenge.startDate, challenge.endDate)
  const today      = toLocalDateKey()

  const handleDelete = () => {
    deleteChallenge(challenge.id)
    onBack()
  }

  const isCompleted = status === 'completed'
  const isExpired = status === 'expired'
  const isUpcoming = status === 'upcoming'
  
  let statusColor = 'var(--color-brand-400)'
  if (isCompleted) statusColor = 'var(--color-brand-500)'
  if (isExpired) statusColor = 'var(--color-destructive)'
  if (isUpcoming) statusColor = 'var(--color-text-muted)'

  // Create a block progress bar (e.g., 20 blocks for detail view)
  const blocks = 20
  const filled = Math.round((pct / 100) * blocks)
  const empty = blocks - filled
  const barStr = '█'.repeat(filled) + '░'.repeat(empty)

  return (
    <main id="challenge-detail-page" className="flex flex-1 flex-col px-6 pt-8 pb-12 max-w-3xl mx-auto w-full">
      {/* Back + actions */}
      <div className="flex justify-between items-center mb-10">
        <button 
          className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-2" 
          onClick={onBack}
        >
          ← Back to Challenges
        </button>
        <div className="flex gap-4">
          <button
            className="text-sm font-medium text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] transition-colors"
            onClick={() => setShowEditor(true)}
          >
            Edit
          </button>
          <button
            className="text-sm font-medium text-[var(--color-destructive)] hover:opacity-80 transition-opacity"
            onClick={() => setConfirmDelete(true)}
            aria-label="Delete challenge"
            title="Delete challenge"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Challenge header */}
      <div className="mb-12 border-l-2 border-[var(--color-brand-400)] pl-5" style={{ borderColor: statusColor }}>
        <div className="flex w-full justify-between items-baseline mb-2 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] m-0 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {challenge.name}
          </h1>
          <span className="text-sm font-bold uppercase tracking-wider" style={{ color: statusColor }}>
            {getStatusLabel(challenge)}
          </span>
        </div>
        <p className="text-base text-[var(--color-text-muted)] font-medium mb-4">
          {formatDateRange(challenge)} · {total} days total
        </p>
        {challenge.description && (
          <p className="text-lg text-[var(--color-text-secondary)] m-0 leading-relaxed max-w-2xl">
            {challenge.description}
          </p>
        )}
        
        {/* Text-based Progress summary */}
        <div className="flex flex-col gap-2 mt-8">
          <div className="flex items-center gap-4 text-[var(--color-brand-400)] font-mono text-base">
            <span>{done} / {total}</span>
            <span className="tracking-[0.1em]">{barStr}</span>
            <span>{pct}%</span>
          </div>
          <div className="text-sm text-[var(--color-text-muted)] font-medium">
            {remaining} day{remaining === 1 ? '' : 's'} remaining
          </div>
        </div>
      </div>

      {/* Daily progress */}
      <section className="mt-8">
        <h2 className="text-sm font-bold tracking-widest text-[var(--color-text-secondary)] uppercase mb-6">
          Daily Progress
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {allDates.map((dateKey) => {
            const isComplete = challenge.completedDates.includes(dateKey)
            const isToday    = dateKey === today
            const isFuture   = dateKey > today
            
            return (
              <div 
                key={dateKey} 
                className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-colors
                  ${isToday ? 'border-[var(--color-brand-500)] bg-[var(--color-surface-overlay)]' : 'border-[var(--color-surface-border)] bg-[var(--color-surface-raised)]'}
                  ${isFuture ? 'opacity-50' : 'hover:border-[var(--color-brand-400)]'}`}
              >
                <button
                  className={`w-5 h-5 flex-shrink-0 rounded-[4px] border-2 flex items-center justify-center transition-all ${isComplete ? 'bg-[var(--color-brand-500)] border-[var(--color-brand-500)] text-[var(--color-surface-base)]' : 'border-[var(--color-text-muted)] hover:border-[var(--color-text-secondary)]'}`}
                  disabled={isFuture}
                  onClick={() => {
                    if (!isComplete) {
                      for (let i = 0; i < 10; i++) {
                        setTimeout(() => {
                          confetti({
                            particleCount: 40,
                            startVelocity: 20,
                            spread: 360,
                            ticks: 80,
                            origin: { 
                              x: 0.2 + Math.random() * 0.6, 
                              y: 0.2 + Math.random() * 0.5 
                            },
                            colors: ['#a3be8c', '#88c0d0', '#81a1c1', '#ebcb8b', '#b48ead'],
                            disableForReducedMotion: true,
                            zIndex: 1000,
                            scalar: 1.1
                          })
                        }, i * 150 + Math.random() * 50)
                      }
                    }
                    toggleDate(challenge.id, dateKey)
                  }}
                  aria-label={isComplete ? `Mark ${dateKey} incomplete` : `Mark ${dateKey} complete`}
                >
                  {isComplete && (
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="animate-in fade-in zoom-in duration-200">
                      <path d="M2.5 7.5L5.5 10.5L11.5 3.5"
                        stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className={`text-sm font-medium flex-1 whitespace-nowrap ${isComplete ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text-primary)]'}`}>
                  {formatShortDate(dateKey)}
                </span>
                {isToday && <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-brand-400)] flex-shrink-0">Today</span>}
              </div>
            )
          })}
        </div>
      </section>

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
          <div role="alertdialog" aria-modal="true" className="ch-confirm-dialog z-50">
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
                className="note-add-btn bg-[var(--color-destructive)] hover:opacity-90"
                style={{ boxShadow: 'none' }}
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
