import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { runSearch, type SearchResult } from '@/utils/searchUtils'

interface CalendarSearchProps {
  onSelect: (result: SearchResult) => void
}

const TYPE_BADGE_CLASS: Record<SearchResult['type'], string> = {
  note: 'cal-search-type--note',
  task: 'cal-search-type--task',
  challenge: 'cal-search-type--challenge',
  habit: 'cal-search-type--habit',
  importantDate: 'cal-search-type--importantDate',
}

export function CalendarSearch({ onSelect }: CalendarSearchProps) {
  const data = useAppStore((s) => s.data)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => runSearch(data, query), [data, query])

  // Clamp the active index to a valid result as results change
  const activeIndexClamped = Math.min(activeIndex, Math.max(0, results.length - 1))

  // Close on outside pointerdown
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const showDropdown = open && query.trim().length > 0

  const handleSelect = useCallback((result: SearchResult) => {
    onSelect(result)
    setOpen(false)
  }, [onSelect])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) {
      if (e.key === 'ArrowDown' && results.length > 0) {
        e.preventDefault()
        setOpen(true)
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const r = results[activeIndexClamped]
      if (r) handleSelect(r)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    }
  }

  return (
    <div className="cal-search" ref={containerRef}>
      <div className="cal-search-input-wrap">
        <svg className="cal-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="6" cy="6" r="4.2" stroke="currentColor" strokeWidth="1.4" />
          <line x1="9.2" y1="9.2" x2="12.5" y2="12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          id="calendar-search"
          className="cal-search-input"
          type="text"
          value={query}
          placeholder="Search…"
          aria-label="Search notes, tasks, dates…"
          autoComplete="off"
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button
            className="cal-search-clear"
            onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus() }}
            aria-label="Clear search"
          >×</button>
        )}
      </div>

      {showDropdown && (
        <div className="cal-search-dropdown" role="listbox" aria-label="Search results">
          {results.length === 0 ? (
            <div className="cal-search-empty">No results for “{query.trim()}”</div>
          ) : (
            <>
              <ul className="cal-search-list">
                {results.map((r, i) => (
                  <li key={r.id}>
                    <button
                      className={[
                        'cal-search-result',
                        i === activeIndexClamped ? 'cal-search-result--active' : '',
                        r.color ? `cal-search-result--color-${r.color}` : '',
                      ].filter(Boolean).join(' ')}
                      role="option"
                      aria-selected={i === activeIndexClamped}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => handleSelect(r)}
                    >
                      <span className="cal-search-date">{r.dateLabel}</span>
                      <span className={`cal-search-type ${TYPE_BADGE_CLASS[r.type]}`}>{r.typeLabel}</span>
                      <span className="cal-search-text">{r.text}</span>
                      {r.detail && <span className="cal-search-detail">{r.detail}</span>}
                    </button>
                  </li>
                ))}
              </ul>
              {results.length >= 50 && (
                <div className="cal-search-more">Showing first 50 results — refine your query</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
