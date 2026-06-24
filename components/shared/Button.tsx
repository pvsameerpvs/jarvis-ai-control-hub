'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  children?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-glow/10 border-primary-glow/40 text-hud-text hover:bg-primary-glow/20 hover:border-primary-glow/60 hover:shadow-[0_0_12px_rgba(0,229,255,0.25)] active:shadow-[0_0_20px_rgba(0,229,255,0.35)]',
  secondary:
    'bg-secondary-blue/10 border-secondary-blue/40 text-hud-text hover:bg-secondary-blue/20 hover:border-secondary-blue/60 hover:shadow-[0_0_12px_rgba(37,99,235,0.25)] active:shadow-[0_0_20px_rgba(37,99,235,0.35)]',
  danger:
    'bg-hud-error/10 border-hud-error/40 text-hud-error hover:bg-hud-error/20 hover:border-hud-error/60 hover:shadow-[0_0_12px_rgba(251,113,133,0.25)] active:shadow-[0_0_20px_rgba(251,113,133,0.35)]',
  ghost:
    'bg-transparent border-transparent text-hud-muted hover:bg-white/5 hover:text-hud-text hover:border-panel-border',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
}

const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
)

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      children,
      className = '',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center rounded-lg border font-mono
          transition-all duration-200 ease-out
          backdrop-blur-sm
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer active:scale-[0.97]'}
          ${className}
        `.trim()}
        {...props}
      >
        {loading ? (
          <Spinner />
        ) : icon ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}
        {children && <span>{children}</span>}
      </button>
    )
  },
)

Button.displayName = 'Button'

export default Button
