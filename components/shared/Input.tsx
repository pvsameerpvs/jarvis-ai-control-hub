'use client'

import { type InputHTMLAttributes, type ReactNode } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  icon?: ReactNode
}

export default function Input({
  label,
  error,
  icon,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-mono text-hud-muted mb-1.5 tracking-wider uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-hud-muted/60 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full rounded-lg border font-mono text-sm text-hud-text
            placeholder:text-hud-muted/30
            backdrop-blur-sm
            transition-all duration-200 ease-out
            ${error ? 'border-hud-error shadow-[0_0_8px_rgba(251,113,133,0.2)]' : 'border-panel-border focus:border-primary-glow focus:shadow-[0_0_12px_rgba(0,229,255,0.15)]'}
            ${icon ? 'pl-10' : 'pl-4'}
            pr-4 py-2.5
            bg-deep-blue/60
            outline-none
            ${className}
          `.trim()}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-mono text-hud-error flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-hud-error shadow-[0_0_4px_rgba(251,113,133,0.6)]" />
          {error}
        </p>
      )}
    </div>
  )
}
