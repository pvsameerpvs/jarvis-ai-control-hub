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
        rounded-xl
        bg-panel-bg
        border border-panel-border
        backdrop-blur-md
        transition-all duration-300 ease-out
        ${glow ? 'shadow-[0_0_20px_rgba(0,229,255,0.12),inset_0_0_20px_rgba(0,229,255,0.03)]' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        hover:border-primary-glow/50 hover:shadow-[0_0_25px_rgba(0,229,255,0.15)]
        ${className}
      `.trim()}
    >
      {(title || icon) && (
        <div className="flex items-center gap-2.5 px-5 pt-4 pb-2 border-b border-panel-border/40">
          {icon && (
            <span className="flex-shrink-0 text-primary-glow/80">{icon}</span>
          )}
          {title && (
            <h3 className="text-sm font-mono text-hud-text font-semibold tracking-wider uppercase">
              {title}
            </h3>
          )}
        </div>
      )}
      <div className={title || icon ? 'p-5' : 'p-5'}>{children}</div>
    </div>
  )
}
