'use client'

import { useEffect, useRef } from 'react'
import HudPanel from './HudPanel'

type LogType = 'info' | 'success' | 'error' | 'command' | 'system'

interface LogEntry {
  timestamp: string
  text: string
  type: LogType
}

interface CommandConsoleProps {
  logs: LogEntry[]
}

const typeStyles: Record<LogType, string> = {
  info: 'text-hud-muted/70',
  success: 'text-hud-success',
  error: 'text-hud-error',
  command: 'text-primary-glow',
  system: 'text-hud-text/50',
}

const typePrefix: Record<LogType, string> = {
  info: '▶',
  success: '✓',
  error: '✗',
  command: '$',
  system: '◆',
}

export default function CommandConsole({ logs }: CommandConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const displayLogs = logs.slice(-50)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [displayLogs.length])

  return (
    <HudPanel title="Console">
      <div
        ref={scrollRef}
        className="relative overflow-y-auto max-h-[320px] px-4 py-3 font-mono text-xs leading-relaxed scrollbar-thin scrollbar-track-transparent scrollbar-thumb-panel-border/30"
        style={{ fontFamily: 'inherit' }}
      >
        {/* Console scan line */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.02]">
          <div className="absolute inset-x-0 h-[1px] bg-primary-glow animate-[scanLine_3s_linear_infinite]" />
        </div>

        {displayLogs.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-hud-muted/20 tracking-wider">
            <span className="animate-pulse">_</span>
            <span className="ml-2">awaiting input...</span>
          </div>
        ) : (
          displayLogs.map((log, i) => (
            <div
              key={`${log.timestamp}-${i}`}
              className="flex items-start gap-2 py-0.5 group"
            >
              <span className="shrink-0 text-hud-muted/30 w-16 text-[10px] tracking-wider tabular-nums">
                {log.timestamp}
              </span>
              <span className={`shrink-0 w-4 ${typeStyles[log.type]}`}>
                {typePrefix[log.type]}
              </span>
              <span className={`${typeStyles[log.type]} break-all`}>
                {log.text}
              </span>
            </div>
          ))
        )}

        {/* Blinking cursor */}
        <div className="flex items-center gap-1 mt-1 text-hud-muted/40">
          <span className="animate-pulse">▊</span>
        </div>
      </div>
    </HudPanel>
  )
}
