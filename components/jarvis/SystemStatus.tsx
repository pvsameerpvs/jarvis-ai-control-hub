'use client'

import HudPanel from './HudPanel'
import StatusBadge from '@/components/shared/StatusBadge'

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

export default function SystemStatus({
  statuses = defaultStatuses,
}: SystemStatusProps) {
  return (
    <HudPanel title="System Status">
      <div className="divide-y divide-panel-border/20">
        {statuses.map((service, i) => (
          <div
            key={service.name}
            className="flex items-center justify-between px-4 py-3 transition-colors duration-200 hover:bg-primary-glow/[0.02]"
          >
            <div className="flex items-center gap-3">
              <span
                className={`text-sm ${
                  service.status === 'connected' || service.status === 'active'
                    ? 'text-primary-glow/60'
                    : 'text-hud-muted/20'
                }`}
              >
                {serviceIcons[service.name] || '•'}
              </span>
              <span className="text-xs font-mono text-hud-text/70 tracking-wide">
                {service.label}
              </span>
            </div>
            <StatusBadge
              status={service.status}
              label={service.label}
              pulsating={service.status === 'connected' || service.status === 'active'}
            />
          </div>
        ))}
      </div>
    </HudPanel>
  )
}
