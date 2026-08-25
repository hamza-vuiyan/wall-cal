import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import type { Challenge } from '@/services/storage'
import {
  getChallengeStatus,
  getStatusLabel,
  getPercentage,
  getTotalDays,
  getCompletedCount,
  formatDateRange,
  type ChallengeStatus,
} from '@/utils/challengeUtils'
import { ChallengeEditorModal } from '@/components/challenges/ChallengeEditorModal'

interface ChallengesPageProps {
  onOpenChallenge: (id: string) => void
}

/** Progress bar + stats row */
function ProgressBar({ challenge }: { challenge: Challenge }) {
  const pct      = getPercentage(challenge)
  const total    = getTotalDays(challenge)
  const done     = getCompletedCount(challenge)

  return (
    <div className="ch-card-progress">
      <div className="ch-progress-track">
        <div
          className={`ch-progress-fill${challenge.color ? ` ch-progress-fill--${challenge.color}` : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="ch-card-stats">
        <span>{done} / {total} days</span>
        <span>{pct}%</span>
      </div>
    </div>
  )
}

/** Individual challenge card */
function ChallengeCard({
  challenge,
  onClick,
}: {
  challenge: Challenge
  onClick: () => void
}) {
  const status = getChallengeStatus(challenge)
  const statusLabel = getStatusLabel(challenge)

  const statusClass: Record<ChallengeStatus, string> = {
    upcoming:  'ch-status--upcoming',
    active:    'ch-status--active',
    completed: 'ch-status--completed',
    expired:   'ch-status--expired',
  }

  return (
    <button
      className={`ch-card${challenge.color ? ` ch-card--${challenge.color}` : ''}`}
      onClick={onClick}
      aria-label={`Open ${challenge.name}`}
    >
      <div className="ch-card-header">
        <div className="ch-card-title-row">
          <h3 className="ch-card-name">{challenge.name}</h3>
          <span className={`ch-status-badge ${statusClass[status]}`}>{statusLabel}</span>
        </div>
        <p className="ch-card-range">{formatDateRange(challenge)}</p>
        {challenge.description && (
          <p className="ch-card-desc">{challenge.description}</p>
        )}
      </div>
      <ProgressBar challenge={challenge} />
    </button>
  )
}

const STATUS_ORDER: ChallengeStatus[] = ['active', 'upcoming', 'completed', 'expired']
const STATUS_LABEL_MAP: Record<ChallengeStatus, string> = {
  active:    'Active',
  upcoming:  'Upcoming',
  completed: 'Completed',
  expired:   'Ended',
}

export function ChallengesPage({ onOpenChallenge }: ChallengesPageProps) {
  const challengesData = useAppStore((s) => s.data.challenges)
  const challenges     = challengesData ?? []
  const addChallenge   = useAppStore((s) => s.addChallenge)
  const [showEditor, setShowEditor] = useState(false)

  // Group challenges by status
  const grouped = challenges.reduce<Record<ChallengeStatus, Challenge[]>>(
    (acc, ch) => {
      const s = getChallengeStatus(ch)
      acc[s].push(ch)
      return acc
    },
    { active: [], upcoming: [], completed: [], expired: [] }
  )

  return (
    <main id="challenges-page" className="challenges-page">
      <div className="challenges-wrapper">
        {/* Page header */}
        <div className="challenges-header">
          <div>
            <h1 className="challenges-title">Challenges</h1>
            <p className="challenges-subtitle">
              {challenges.length === 0
                ? 'Create your first challenge to get started.'
                : `${challenges.length} challenge${challenges.length > 1 ? 's' : ''} total`}
            </p>
          </div>
          <button
            className="note-add-btn ch-create-btn"
            onClick={() => setShowEditor(true)}
            id="create-challenge-btn"
          >
            + Create Challenge
          </button>
        </div>

        {/* Empty state */}
        {challenges.length === 0 && (
          <div className="challenges-empty">
            <div className="challenges-empty-icon" aria-hidden="true">🎯</div>
            <p>No challenges yet.</p>
            <p className="challenges-empty-hint">
              Create a challenge to track streaks, habits, or multi-day goals.
            </p>
            <button
              className="note-add-btn"
              onClick={() => setShowEditor(true)}
            >
              + Create your first challenge
            </button>
          </div>
        )}

        {/* Grouped challenge sections */}
        {STATUS_ORDER.map((status) => {
          const group = grouped[status]
          if (group.length === 0) return null
          return (
            <section key={status} className="challenges-section">
              <h2 className="challenges-section-title">{STATUS_LABEL_MAP[status]}</h2>
              <div className="challenges-grid">
                {group.map((ch) => (
                  <ChallengeCard
                    key={ch.id}
                    challenge={ch}
                    onClick={() => onOpenChallenge(ch.id)}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* Create editor */}
      {showEditor && (
        <ChallengeEditorModal
          onSave={(data) => addChallenge(data)}
          onClose={() => setShowEditor(false)}
        />
      )}
    </main>
  )
}
