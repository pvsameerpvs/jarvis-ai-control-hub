'use client'

type StatusType = 'active' | 'inactive' | 'error' | 'warning' | 'connected' | 'disconnected'

interface StatusBadgeProps {
  status: StatusType
  label?: string
  pulsating?: boolean
}

const statusColors: Record<StatusType, string> = {
  active: 'bg-hud-success shadow-[0_0_6px_rgba(34,197,94,0.6)]',
  inactive: 'bg-hud-muted/40 shadow-[0_0_6px_rgba(125,211,252,0.2)]',
  error: 'bg-hud-error shadow-[0_0_6px_rgba(251,113,133,0.6)]',
  warning: 'bg-hud-warning shadow-[0_0_6px_rgba(250,204,21,0.6)]',
  connected: 'bg-hud-success shadow-[0_0_6px_rgba(34,197,94,0.6)]',
  disconnected: 'bg-hud-error shadow-[0_0_6px_rgba(251,113,133,0.6)]',
}

const statusLabels: Record<StatusType, string> = {
  active: 'Active',
  inactive: 'Inactive',
  error: 'Error',
  warning: 'Warning',
  connected: 'Connected',
  disconnected: 'Disconnected',
}

export default function StatusBadge({
  status,
  label,
  pulsating = false,
}: StatusBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs">
      <span
        className={`
          inline-block w-2 h-2 rounded-full flex-shrink-0
          ${statusColors[status]}
          ${pulsating ? 'animate-pulse' : ''}
        `.trim()}
      />
      <span className="text-hud-text/80 tracking-wide">
        {label ?? statusLabels[status]}
      </span>
    </span>
  )
}
