import { useEffect, useRef } from 'react'
import type { MarkType } from '@/services/storage'

interface MarkPickerProps {
  /** Currently selected mark on this day (or undefined) */
  currentMark?: MarkType
  onSelect: (mark: MarkType | null) => void
  onClose: () => void
}

const OPTIONS: { mark: MarkType | null; label: string; symbol: string }[] = [
  { mark: 'x',      label: 'Mark X',      symbol: '✕' },
  { mark: 'check',  label: 'Check mark',  symbol: '✓' },
  { mark: 'circle', label: 'Circle',      symbol: '○' },
  { mark: null,     label: 'Remove mark', symbol: '⊘' },
]

/**
 * Small contextual popover for choosing a day mark.
 * Closes on Escape or outside click.
 */
export function MarkPicker({ currentMark, onSelect, onClose }: MarkPickerProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('pointerdown', onPointerDown, { capture: true })
    return () => document.removeEventListener('pointerdown', onPointerDown, { capture: true })
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="mark-picker"
      role="menu"
      aria-label="Choose a mark"
    >
      {OPTIONS.map(({ mark, label, symbol }) => {
        const isActive = mark === currentMark
        const isRemove = mark === null

        // Don't show "Remove" if there's nothing to remove
        if (isRemove && !currentMark) return null

        return (
          <button
            key={label}
            role="menuitem"
            aria-label={label}
            aria-pressed={isActive}
            onClick={(e) => {
              e.stopPropagation()
              onSelect(mark)
              onClose()
            }}
            className={[
              'mark-picker-item',
              isActive ? 'mark-picker-item--active' : '',
              isRemove ? 'mark-picker-item--remove' : '',
            ].filter(Boolean).join(' ')}
          >
            <span className="mark-picker-symbol" aria-hidden="true">{symbol}</span>
            <span className="mark-picker-label">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
