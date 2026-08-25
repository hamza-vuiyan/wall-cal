import { useEffect, useRef } from 'react'
import type { DayColor } from '@/services/storage'
import { DAY_COLOR_PALETTE } from '@/services/storage'

interface ColorPickerProps {
  currentColor?: DayColor
  onSelect: (color: DayColor | null) => void
  onClose: () => void
}

/**
 * Small inline popover for selecting a day highlight colour.
 * Closes on outside click or Escape.
 */
export function ColorPicker({ currentColor, onSelect, onClose }: ColorPickerProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click (capture phase so it wins before other handlers)
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
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
      className="color-picker"
      role="menu"
      aria-label="Choose a highlight colour"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="color-picker-swatches">
        {DAY_COLOR_PALETTE.map(({ id, label }) => (
          <button
            key={id}
            role="menuitemradio"
            aria-checked={id === currentColor}
            aria-label={label}
            title={label}
            className={[
              'color-swatch',
              `color-swatch--${id}`,
              id === currentColor ? 'color-swatch--active' : '',
            ].filter(Boolean).join(' ')}
            onClick={(e) => {
              e.stopPropagation()
              // Clicking the active colour again → remove it
              onSelect(id === currentColor ? null : id)
              onClose()
            }}
          >
            {id === currentColor && (
              <svg className="color-swatch-check" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 5.5L4 7.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        ))}
      </div>

      {currentColor && (
        <button
          className="color-picker-remove"
          onClick={(e) => {
            e.stopPropagation()
            onSelect(null)
            onClose()
          }}
        >
          Remove colour
        </button>
      )}
    </div>
  )
}
