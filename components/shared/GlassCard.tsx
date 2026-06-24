'use client'

import { type ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  title?: string
  icon?: ReactNode
  glow?: boolean
  onClick?: () => void
}

function Corner({ className }: { className?: string }) {
  return (
    <svg className={`absolute w-2.5 h-2.5 text-primary-glow/15 pointer-events-none ${className || ''}`} viewBox="0 0 10 10" fill="none">
      <path d="M9 1H1V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function GlassCard({
  children,
  className = '',
  title,
  icon,
  glow = false,
  onClick,
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-xl
        bg-panel-bg backdrop-blur-md
        border transition-all duration-300 ease-out
        ${glow
          ? 'border-primary-glow/40 shadow-[0_0_25px_rgba(0,229,255,0.12),inset_0_0_25px_rgba(0,229,255,0.03)]'
          : 'border-panel-border hover:border-primary-glow/40'}
        ${onClick ? 'cursor-pointer' : ''}
        hover:shadow-[0_0_25px_rgba(0,229,255,0.08)]
        ${className}
      `.trim()}
    >
      {/* Corners */}
      <Corner className="top-[6px] left-[6px]" />
      <Corner className="top-[6px] right-[6px] rotate-90" />
      <Corner className="bottom-[6px] left-[6px] -rotate-90" />
      <Corner className="bottom-[6px] right-[6px] rotate-180" />

      {/* Scan line */}
      <div className="pointer-events-none absolute inset-0 rounded-xl overflow-hidden opacity-[0.02]">
        <div className="absolute inset-x-4 h-[1px] bg-primary-glow animate-scanLine" />
      </div>

      {/* Header */}
      {(title || icon) && (
        <div className="relative flex items-center gap-2.5 px-5 pt-4 pb-2 border-b border-panel-border/30">
          {icon && (
            <span className="flex-shrink-0 text-primary-glow/70 text-sm">{icon}</span>
          )}
          {title && (
            <h3 className="text-xs font-mono text-hud-text font-semibold tracking-[0.15em] uppercase">
              {title}
            </h3>
          )}
          {/* Header dot indicators */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-primary-glow/40" />
            <span className="w-1 h-1 rounded-full bg-primary-glow/20" />
            <span className="w-1 h-1 rounded-full bg-primary-glow/10" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className={title || icon ? 'p-5' : 'p-5'}>{children}</div>
    </div>
  )
}
