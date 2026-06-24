'use client'

import HudPanel from './HudPanel'

type ServiceStatus = 'active' | 'inactive' | 'error' | 'warning' | 'connected' | 'disconnected'

interface SystemStatusEntry {
  name: string
  status: ServiceStatus
  label: string
}

interface SystemStatusProps {
  statuses?: SystemStatusEntry[]
}

const defaultStatuses: SystemStatusEntry[] = [
  { name: 'gemini', status: 'connected', label: 'Gemini AI' },
  { name: 'camera', status: 'disconnected', label: 'Camera' },
  { name: 'gmail', status: 'connected', label: 'Gmail' },
  { name: 'telegram', status: 'connected', label: 'Telegram' },
  { name: 'browser', status: 'active', label: 'Browser Control' },
  { name: 'erp', status: 'disconnected', label: 'ERP Connector' },
  { name: 'mcp', status: 'active', label: 'MCP Tools' },
]

const serviceIcons: Record<string, string> = {
  gemini: '◈',
  camera: '◉',
  gmail: '◎',
  telegram: '◉',
  browser: '◇',
  erp: '◆',
  mcp: '✦',
}

const statusColor: Record<ServiceStatus, { dot: string; text: string; bar: string }> = {
  active:       { dot: 'bg-hud-success shadow-[0_0_6px_rgba(34,197,94,0.6)]', text: 'text-hud-success', bar: 'bg-hud-success/20' },
  connected:    { dot: 'bg-hud-success shadow-[0_0_6px_rgba(34,197,94,0.6)]', text: 'text-hud-success', bar: 'bg-hud-success/20' },
  error:        { dot: 'bg-hud-error shadow-[0_0_6px_rgba(251,113,133,0.6)]', text: 'text-hud-error', bar: 'bg-hud-error/20' },
  warning:      { dot: 'bg-hud-warning shadow-[0_0_6px_rgba(250,204,21,0.6)]', text: 'text-hud-warning', bar: 'bg-hud-warning/20' },
  inactive:     { dot: 'bg-hud-muted/30 shadow-[0_0_4px_rgba(125,211,252,0.15)]', text: 'text-hud-muted/30', bar: 'bg-white/[0.02]' },
  disconnected: { dot: 'bg-hud-error/50 shadow-[0_0_4px_rgba(251,113,133,0.25)]', text: 'text-hud-error/60', bar: 'bg-hud-error/10' },
}

const isOnline = (s: ServiceStatus) => s === 'active' || s === 'connected'

export default function SystemStatus({ statuses = defaultStatuses }: SystemStatusProps) {
  const onlineCount = statuses.filter(s => isOnline(s.status)).length

  return (
    <HudPanel title="System Status" side="right">
      {/* Header stats */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-panel-border/20">
        <span className="text-[10px] font-mono text-hud-muted/40 tracking-wider">
          SERVICES
        </span>
        <span className="text-[10px] font-mono text-hud-muted/40 tracking-wider">
          <span className="text-hud-success">{onlineCount}</span>
          <span className="text-hud-muted/20 mx-1">/</span>
          <span>{statuses.length}</span>
          <span className="ml-2">ONLINE</span>
        </span>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-3 px-4 py-1.5 text-[8px] font-mono text-hud-muted/20 tracking-[0.2em] uppercase border-b border-panel-border/10">
        <span className="w-3 shrink-0" />
        <span className="flex-1">service</span>
        <span className="w-14 text-right">status</span>
        <span className="w-16 text-right hidden sm:inline-block">load</span>
      </div>

      {/* Service rows */}
      <div className="divide-y divide-panel-border/10">
        {statuses.map((service) => {
          const colors = statusColor[service.status]
          const online = isOnline(service.status)
          return (
            <div
              key={service.name}
              className={`relative flex items-center gap-3 px-4 py-2.5 transition-all duration-200 ${
                online ? 'hover:bg-primary-glow/[0.02]' : ''
              }`}
            >
              {/* Active indicator bar */}
              {online && (
                <span className="absolute left-0 top-1 bottom-1 w-[2px] rounded-r-full bg-hud-success/40 shadow-[0_0_4px_rgba(34,197,94,0.2)]" />
              )}

              {/* Icon */}
              <span className={`w-3 shrink-0 text-xs ${online ? 'text-primary-glow/60' : 'text-hud-muted/15'}`}>
                {serviceIcons[service.name] || '•'}
              </span>

              {/* Name */}
              <span className={`flex-1 text-[11px] font-mono tracking-wide truncate ${
                online ? 'text-hud-text/80' : 'text-hud-muted/25'
              }`}>
                {service.label}
              </span>

              {/* Status dot + label */}
              <div className="flex items-center gap-1.5 w-14 justify-end">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${colors.dot} ${online ? 'animate-pulse' : ''}`} />
                <span className={`text-[9px] font-mono tracking-wider ${colors.text}`}>
                  {online ? 'LIVE' : 'DOWN'}
                </span>
              </div>

              {/* Load bar */}
              <div className="w-16 hidden sm:flex items-center gap-1.5 justify-end">
                <div className="w-10 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                    style={{ width: online ? `${40 + Math.random() * 50}%` : '8%' }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom status line */}
      <div className="flex items-center gap-2 px-4 py-1.5 border-t border-panel-border/20">
        <span className="w-1 h-1 rounded-full bg-hud-success shadow-[0_0_4px_rgba(34,197,94,0.4)] animate-pulse" />
        <span className="text-[8px] font-mono text-hud-muted/30 tracking-wider uppercase">
          monitoring {statuses.length} services · {onlineCount} online
        </span>
      </div>
    </HudPanel>
  )
}
