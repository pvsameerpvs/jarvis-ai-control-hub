'use client'

import { useState, useEffect } from 'react'

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

export default function TimePanel() {
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date())
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!time) return null

  const hours = pad(time.getHours())
  const minutes = pad(time.getMinutes())
  const dayName = time.toLocaleDateString('en-US', { weekday: 'short' })
  const monthName = time.toLocaleDateString('en-US', { month: 'short' })
  const date = time.getDate()

  return (
    <div className="flex items-center gap-3 font-mono">
      <div className="text-sm text-blue-400/90 tracking-[0.06em] tabular-nums font-medium">
        {hours}:{minutes}
      </div>
      <div className="text-[9px] text-blue-500/40 tracking-wider uppercase">
        {dayName} {monthName} {date}
      </div>
      <div className="w-1 h-1 rounded-full bg-blue-500/30" />
    </div>
  )
}
