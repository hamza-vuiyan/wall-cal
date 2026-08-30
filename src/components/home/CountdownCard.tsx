import { useEffect, useState } from 'react'
import type { ImportantDate } from '@/services/storage'
import { iconEmoji } from '@/utils/importantDateUtils'

interface CountdownCardProps {
  importantDate: ImportantDate
  onClick: () => void
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  isPast: boolean
}

function calculateTimeRemaining(dateStr: string, timeStr?: string): TimeRemaining {
  // If time is provided, use it. Otherwise, default to midnight (00:00:00).
  const targetDateStr = timeStr ? `${dateStr}T${timeStr}:00` : `${dateStr}T00:00:00`
  const targetDate = new Date(targetDateStr)
  
  // Get current time
  const now = new Date()
  
  const diff = targetDate.getTime() - now.getTime()
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true }
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / 1000 / 60) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  
  return { days, hours, minutes, seconds, isPast: false }
}

function pad(num: number): string {
  return num.toString().padStart(2, '0')
}

export function CountdownCard({ importantDate, onClick }: CountdownCardProps) {
  const [remaining, setRemaining] = useState<TimeRemaining>(() => calculateTimeRemaining(importantDate.date, importantDate.time))
  
  useEffect(() => {
    const update = () => {
      setRemaining(calculateTimeRemaining(importantDate.date, importantDate.time))
    }
    
    // Update immediately and then every second
    update()
    const intervalId = setInterval(update, 1000)
    
    return () => clearInterval(intervalId)
  }, [importantDate.date, importantDate.time])
  
  const colorClass = importantDate.color ? `countdown-card--${importantDate.color}` : ''
  const emoji = importantDate.icon ? iconEmoji(importantDate.icon) : null
  
  let timeDisplay = null
  
  if (remaining.isPast) {
    timeDisplay = (
      <div className="countdown-past">
        <div className="countdown-past-icon">🎉</div>
        <div>Today!</div>
      </div>
    )
  } else if (remaining.days > 0) {
    timeDisplay = (
      <div className="countdown-time">
        <div className="countdown-days">
          <span className="countdown-value">{remaining.days}</span>
          <span className="countdown-label">DAYS</span>
        </div>
        <div className="countdown-sub">
          {pad(remaining.hours)}h &nbsp;{pad(remaining.minutes)}m &nbsp;{pad(remaining.seconds)}s
        </div>
      </div>
    )
  } else if (remaining.hours > 0) {
    timeDisplay = (
      <div className="countdown-time">
        <div className="countdown-short">
          {pad(remaining.hours)}h : {pad(remaining.minutes)}m : {pad(remaining.seconds)}s
        </div>
      </div>
    )
  } else if (remaining.minutes > 0) {
    timeDisplay = (
      <div className="countdown-time">
        <div className="countdown-short">
          {pad(remaining.minutes)}m : {pad(remaining.seconds)}s
        </div>
      </div>
    )
  } else {
    timeDisplay = (
      <div className="countdown-time">
        <div className="countdown-short">
          {pad(remaining.seconds)}s
        </div>
      </div>
    )
  }
  
  // Format target date display
  const targetDateObj = new Date(importantDate.date)
  let dateDisplayStr = targetDateObj.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
  if (importantDate.time) {
    const timeParts = importantDate.time.split(':')
    const d = new Date()
    d.setHours(parseInt(timeParts[0], 10), parseInt(timeParts[1], 10))
    const timeStr = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    dateDisplayStr = `${dateDisplayStr} · ${timeStr}`
  }

  return (
    <button 
      className={`countdown-card ${colorClass}`}
      onClick={onClick}
      aria-label={`Countdown for ${importantDate.title}`}
    >
      <div className="countdown-header">
        {emoji && <span className="countdown-emoji">{emoji}</span>}
        <span className="countdown-title">{importantDate.title}</span>
      </div>
      
      <div className="countdown-body">
        {timeDisplay}
      </div>
      
      <div className="countdown-footer">
        {dateDisplayStr}
      </div>
    </button>
  )
}
