'use client'

import HudPanel from './HudPanel'

type ToolStatus = 'running' | 'completed' | 'failed' | 'pending'

interface ToolAction {
  toolName: string
  status: ToolStatus
  timestamp: string
  description: string
}

interface ToolStatusPanelProps {
  latestActions: ToolAction[]
}

const statusColors: Record<ToolStatus, string> = {
  running: 'bg-primary-glow shadow-[0_0_6px_rgba(0,229,255,0.6)] animate-pulse',
  completed: 'bg-hud-success shadow-[0_0_6px_rgba(34,197,94,0.6)]',
  failed: 'bg-hud-error shadow-[0_0_6px_rgba(251,113,133,0.6)]',
  pending: 'bg-hud-muted/30 shadow-[0_0_4px_rgba(125,211,252,0.2)]',
}

const statusLabels: Record<ToolStatus, string> = {
  running: 'RUNNING',
  completed: 'DONE',
  failed: 'FAILED',
  pending: 'PENDING',
}

const toolIcons: Record<string, string> = {
  gemini: '◈',
  search: '◎',
  navigate: '◇',
  click: '▸',
  type: '✎',
  screenshot: '◉',
  gmail: '◎',
  telegram: '◉',
  browser: '◇',
  erp: '◆',
  system: '⚙',
  camera: '◉',
}

function getToolIcon(toolName: string): string {
  const lower = toolName.toLowerCase()
  for (const [key, icon] of Object.entries(toolIcons)) {
    if (lower.includes(key)) return icon
  }
  return '▸'
}

export default function ToolStatusPanel({
  latestActions,
}: ToolStatusPanelProps) {
  return (
    <HudPanel title="Tool Execution">
      {latestActions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-hud-muted/20 gap-2">
          <span className="text-2xl">⚙</span>
          <span className="text-xs font-mono tracking-wider">no tools executed</span>
        </div>
      ) : (
        <div className="divide-y divide-panel-border/20">
          {latestActions.map((action, i) => (
            <div
              key={`${action.timestamp}-${action.toolName}-${i}`}
              className={`px-4 py-3 transition-all duration-300 ${
                action.status === 'running'
                  ? 'bg-primary-glow/[0.03] border-l-2 border-primary-glow'
                  : action.status === 'failed'
                    ? 'bg-hud-error/[0.03]'
                    : 'hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`shrink-0 text-sm ${
                      action.status === 'running'
                        ? 'text-primary-glow'
                        : action.status === 'completed'
                          ? 'text-hud-success'
                          : action.status === 'failed'
                            ? 'text-hud-error'
                            : 'text-hud-muted/30'
                    }`}
                  >
                    {getToolIcon(action.toolName)}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-mono truncate ${
                        action.status === 'running'
                          ? 'text-primary-glow font-semibold'
                          : 'text-hud-text/80'
                      }`}
                    >
                      {action.toolName}
                    </p>
                    <p className="text-[10px] font-mono text-hud-muted/40 truncate mt-0.5">
                      {action.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${statusColors[action.status]}`}
                  />
                  <span className="text-[10px] font-mono text-hud-muted/40 tabular-nums">
                    {action.timestamp}
                  </span>
                </div>
              </div>
              {action.status === 'running' && (
                <div className="mt-2 h-px bg-gradient-to-r from-primary-glow/40 via-primary-glow/20 to-transparent" />
              )}
            </div>
          ))}
        </div>
      )}
    </HudPanel>
  )
}
