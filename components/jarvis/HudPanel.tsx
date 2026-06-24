'use client'

import { type ReactNode } from 'react'

interface HudPanelProps {
  title: string
  children: ReactNode
  className?: string
  side?: 'left' | 'right'
  glow?: boolean
}

export default function HudPanel({
  title,
  children,
  className = '',
  side = 'left',
  glow = false,
}: HudPanelProps) {
  return (
    <div
      className={`
        relative rounded-lg border
        bg-panel-bg backdrop-blur-md
        transition-all duration-500 ease-out
        ${glow
          ? 'border-primary-glow/50 shadow-[0_0_25px_rgba(0,229,255,0.15),inset_0_0_25px_rgba(0,229,255,0.05)]'
          : 'border-panel-border'}
        ${side === 'left' ? 'border-l-2' : 'border-r-2'}
        overflow-hidden
        ${className}
      `.trim()}
    >
      {/* Scan line overlay */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.03]">
        <div className="absolute inset-x-0 h-[1px] bg-primary-glow animate-[scanLine_4s_linear_infinite]" />
      </div>

      {/* Corner brackets */}
      <div className="pointer-events-none absolute top-0 left-0 text-panel-border text-xs leading-none select-none">
        {side === 'left' ? '┌' : '┐'}
      </div>
      <div className="pointer-events-none absolute top-0 right-0 text-panel-border text-xs leading-none select-none">
        {side === 'left' ? '┐' : '┌'}
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 text-panel-border text-xs leading-none select-none">
        {side === 'left' ? '└' : '┘'}
      </div>
      <div className="pointer-events-none absolute bottom-0 right-0 text-panel-border text-xs leading-none select-none">
        {side === 'left' ? '┘' : '└'}
      </div>

      {/* Header */}
      <div className="relative flex items-center gap-3 px-4 py-3 border-b border-panel-border/40">
        <div className="flex-1">
          <h2 className="text-xs font-mono text-hud-text font-semibold tracking-[0.15em] uppercase">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-glow/60 shadow-[0_0_4px_rgba(0,229,255,0.4)]" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary-glow/30" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary-glow/10" />
        </div>
      </div>

      {/* Decorative scan line under header */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary-glow/20 to-transparent" />

      {/* Content */}
      <div className="relative max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-panel-border/30">
        {children}
      </div>
    </div>
  )
}
