import type { MarkType } from '@/services/storage'

interface DayMarkProps {
  type: MarkType
}

/**
 * Renders a hand-drawn SVG mark inside a calendar day cell.
 * Each mark uses slightly irregular paths to feel like a physical pen stroke
 * rather than a polished icon.
 */
export function DayMark({ type }: DayMarkProps) {
  return (
    <div className="day-mark-wrapper" aria-hidden="true">
      {type === 'x' && <XMark />}
      {type === 'check' && <CheckMark />}
      {type === 'circle' && <CircleMark />}
    </div>
  )
}

/** Hand-drawn X — two crossing strokes with slight imperfection */
function XMark() {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="day-mark day-mark--x"
    >
      {/* Stroke 1: top-left to bottom-right, slightly off-center */}
      <path
        d="M9 8.5 C13 13 27.5 27 31.5 31.5"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Stroke 2: top-right to bottom-left, starts a hair off */}
      <path
        d="M31 9 C27 13.5 13.5 26.5 9.5 31"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Hand-drawn check mark — a natural sweeping tick */
function CheckMark() {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="day-mark day-mark--check"
    >
      <path
        d="M7 21 C10 24.5 14.5 29.5 16.5 31.5 C20 25 28 14 34 9"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Hand-drawn circle — slightly imperfect ellipse */
function CircleMark() {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="day-mark day-mark--circle"
    >
      <path
        d="M20 7 C29.5 7 33.5 12.5 33.5 20.5 C33.5 29 27.5 33.5 20 33.5 C12 33.5 6.5 28 6.5 20 C6.5 12.5 11.5 7.5 20 7 Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
