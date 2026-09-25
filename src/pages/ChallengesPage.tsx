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

/** Text-based progress bar */
function TextProgressBar({ challenge }: { challenge: Challenge }) {
  const pct      = getPercentage(challenge)
  const total    = getTotalDays(challenge)
  const done     = getCompletedCount(challenge)
  
  // Create a block progress bar (e.g., 10 blocks)
  const blocks = 10
  const filled = Math.round((pct / 100) * blocks)
  const empty = blocks - filled
  
  const barStr = '█'.repeat(filled) + '░'.repeat(empty)

  return (
    <div className="flex flex-col gap-1 mt-3">
      <div className="flex items-center gap-4 text-[var(--color-brand-400)] font-mono text-sm">
        <span>{done} / {total}</span>
        <span className="tracking-[0.1em]">{barStr}</span>
        <span>{pct}%</span>
      </div>
      <div className="text-xs text-[var(--color-text-muted)] font-medium">
        {total - done} day{total - done === 1 ? '' : 's'} remaining
      </div>
    </div>
  )
}

/** Individual challenge row */
function ChallengeRow({
  challenge,
  onClick,
}: {
  challenge: Challenge
  onClick: () => void
}) {
  const status = getChallengeStatus(challenge)
  const statusLabel = getStatusLabel(challenge)

  const isCompleted = status === 'completed'
  const isExpired = status === 'expired'
  const isUpcoming = status === 'upcoming'
  
  let statusColor = 'var(--color-brand-400)'
  if (isCompleted) statusColor = 'var(--color-brand-500)'
  if (isExpired) statusColor = 'var(--color-destructive)'
  if (isUpcoming) statusColor = 'var(--color-text-muted)'

  return (
    <div
      className={`group flex flex-col items-start p-5 cursor-pointer border-l-2 transition-colors
        ${isCompleted ? 'border-[var(--color-brand-500)] bg-[var(--color-surface-overlay)]' : 
          isExpired ? 'border-[var(--color-destructive)] opacity-70' : 
          'border-[var(--color-surface-border)] hover:border-[var(--color-brand-300)]'}`}
      onClick={onClick}
    >
      <div className="flex w-full justify-between items-baseline mb-1 gap-4">
        <h3 className={`text-xl font-medium m-0 transition-colors ${isCompleted || isExpired ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-300)]'}`}>
          {challenge.name}
        </h3>
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: statusColor }}>
          {statusLabel}
        </span>
      </div>
      
      <p className="text-sm font-medium text-[var(--color-text-muted)] mb-2">
        {formatDateRange(challenge)}
      </p>
      
      {challenge.description && (
        <p className="text-base text-[var(--color-text-secondary)] m-0 leading-relaxed max-w-2xl">
          {challenge.description}
        </p>
      )}
      
      <TextProgressBar challenge={challenge} />
    </div>
  )
}

const STATUS_ORDER: ChallengeStatus[] = ['active', 'upcoming', 'completed', 'expired']
const STATUS_LABEL_MAP: Record<ChallengeStatus, string> = {
  active:    'Active Challenges',
  upcoming:  'Upcoming',
  completed: 'Completed',
  expired:   'Ended',
}

export function ChallengesPage({ onOpenChallenge }: ChallengesPageProps) {
  const challengesData = useAppStore((s) => s.data.challenges)
  const challenges     = challengesData ?? []
  const addChallenge   = useAppStore((s) => s.addChallenge)
  const [showEditor, setShowEditor] = useState(false)

  const grouped = challenges.reduce<Record<ChallengeStatus, Challenge[]>>(
    (acc, ch) => {
      const s = getChallengeStatus(ch)
      acc[s].push(ch)
      return acc
    },
    { active: [], upcoming: [], completed: [], expired: [] }
  )

  return (
    <main id="challenges-page" className="flex flex-1 flex-col px-6 pt-12 pb-12 max-w-3xl mx-auto w-full">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)] mb-2 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Challenges.
          </h1>
          <p className="text-xl text-[var(--color-text-secondary)] font-medium">
            {challenges.length === 0
              ? 'Start building a habit today.'
              : `${challenges.length} challenge${challenges.length > 1 ? 's' : ''} total`}
          </p>
        </div>
        <button
          className="text-sm font-medium text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] transition-colors mb-1"
          onClick={() => setShowEditor(true)}
          id="create-challenge-btn"
        >
          + Create Challenge
        </button>
      </header>

      {/* Empty state */}
      {challenges.length === 0 && (
        <div className="py-8 border-l-2 border-[var(--color-surface-border)] pl-6">
          <p className="text-[var(--color-text-secondary)] italic mb-4 text-lg">No challenges yet.</p>
          <p className="text-[var(--color-text-muted)] mb-6 max-w-md">
            Create a challenge to track streaks, build habits, or reach multi-day goals.
          </p>
          <button
            className="px-5 py-2 bg-[var(--color-surface-raised)] border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] font-medium rounded-lg transition-colors text-sm"
            onClick={() => setShowEditor(true)}
          >
            Create your first challenge
          </button>
        </div>
      )}

      {/* Grouped challenge sections */}
      <div className="flex flex-col gap-12">
        {STATUS_ORDER.map((status) => {
          const group = grouped[status]
          if (group.length === 0) return null
          return (
            <section key={status} className="flex flex-col gap-4">
              <h2 className="text-sm font-bold tracking-widest text-[var(--color-text-secondary)] uppercase m-0">
                {STATUS_LABEL_MAP[status]}
              </h2>
              <div className="flex flex-col gap-6">
                {group.map((ch) => (
                  <ChallengeRow
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
