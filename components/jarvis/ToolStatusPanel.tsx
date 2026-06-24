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

const statusMeta: Record<ToolStatus, { dot: string; label: string; line: string }> = {
  running: {
    dot: 'bg-primary-glow shadow-[0_0_6px_rgba(0,229,255,0.6)] animate-pulse',
    label: 'RUNNING',
    line: 'border-l-primary-glow bg-primary-glow/[0.03]',
  },
  completed: {
    dot: 'bg-hud-success shadow-[0_0_6px_rgba(34,197,94,0.6)]',
    label: 'DONE',
    line: 'border-l-hud-success/30',
  },
  failed: {
    dot: 'bg-hud-error shadow-[0_0_6px_rgba(251,113,133,0.6)]',
    label: 'FAIL',
    line: 'border-l-hud-error/40 bg-hud-error/[0.02]',
  },
  pending: {
    dot: 'bg-hud-muted/20',
    label: 'WAIT',
    line: 'border-l-hud-muted/10',
  },
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

export default function ToolStatusPanel({ latestActions }: ToolStatusPanelProps) {
  return (
    <HudPanel title="Tool Execution" side="right">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-panel-border/20">
        <span className="text-[10px] font-mono text-hud-muted/40 tracking-wider">
          COMMAND LOG
        </span>
        <span className="text-[10px] font-mono text-hud-muted/20 tracking-wider">
          {latestActions.length > 0 && (
            <>
              <span className="text-hud-success">{latestActions.filter(a => a.status === 'completed').length}</span>
              <span className="text-hud-muted/15 mx-1">/</span>
              <span>{latestActions.length}</span>
            </>
          )}
        </span>
      </div>

      {latestActions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="relative">
            <span className="text-3xl text-hud-muted/10">⚙</span>
            <span className="absolute inset-0 text-3xl text-hud-muted/5 blur-sm">⚙</span>
          </div>
          <span className="text-[10px] font-mono text-hud-muted/20 tracking-[0.2em] uppercase">
            awaiting commands
          </span>
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-hud-muted/10 animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 rounded-full bg-hud-muted/10 animate-pulse" style={{ animationDelay: '200ms' }} />
            <span className="w-1 h-1 rounded-full bg-hud-muted/10 animate-pulse" style={{ animationDelay: '400ms' }} />
          </div>
        </div>
      ) : (
        <div className="divide-y divide-panel-border/10">
          {latestActions.map((action, i) => {
            const meta = statusMeta[action.status]
            const isLatest = i === 0

            return (
              <div
                key={`${action.timestamp}-${action.toolName}-${i}`}
                className={`
                  relative flex items-start gap-3 px-4 py-2.5
                  border-l-2 transition-all duration-300
                  ${meta.line}
                  ${isLatest && action.status === 'running' ? 'animate-hudFlicker' : ''}
                `.trim()}
              >
                {/* Timeline connector */}
                {i < latestActions.length - 1 && (
                  <span className="absolute left-[17px] top-8 bottom-0 w-px bg-panel-border/15" />
                )}

                {/* Icon */}
                <div className="relative shrink-0 mt-0.5">
                  <span className={`text-xs ${
                    action.status === 'running' ? 'text-primary-glow' :
                    action.status === 'completed' ? 'text-hud-success' :
                    action.status === 'failed' ? 'text-hud-error' :
                    'text-hud-muted/20'
                  }`}>
                    {getToolIcon(action.toolName)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {/* Tool name as command */}
                    <span className="text-[10px] font-mono text-hud-muted/30 select-none">$</span>
                    <span className={`text-[11px] font-mono truncate ${
                      action.status === 'running' ? 'text-primary-glow font-semibold' :
                      action.status === 'completed' ? 'text-hud-text/80' :
                      action.status === 'failed' ? 'text-hud-error/80' :
                      'text-hud-muted/30'
                    }`}>
                      {action.toolName}
                    </span>
                    {action.status === 'running' && (
                      <span className="inline-block w-1.5 h-3.5 bg-primary-glow/70 animate-pulse rounded-sm" />
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-hud-muted/35 truncate mt-0.5 pl-3">
                    {action.description}
                  </p>
                </div>

                {/* Status + timestamp */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                  <span className={`text-[9px] font-mono tracking-wider ${
                    action.status === 'failed' ? 'text-hud-error/60' :
                    action.status === 'running' ? 'text-primary-glow/60' :
                    action.status === 'completed' ? 'text-hud-success/60' :
                    'text-hud-muted/20'
                  }`}>
                    {meta.label}
                  </span>
                  <span className="text-[9px] font-mono text-hud-muted/20 tabular-nums hidden sm:inline-block">
                    {action.timestamp}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Bottom status line */}
      <div className="flex items-center gap-2 px-4 py-1.5 border-t border-panel-border/20">
        {latestActions.some(a => a.status === 'running') ? (
          <>
            <span className="w-1 h-1 rounded-full bg-primary-glow shadow-[0_0_4px_rgba(0,229,255,0.5)] animate-pulse" />
            <span className="text-[8px] font-mono text-primary-glow/40 tracking-wider uppercase">
              executing...
            </span>
          </>
        ) : (
          <>
            <span className="w-1 h-1 rounded-full bg-hud-muted/20" />
            <span className="text-[8px] font-mono text-hud-muted/20 tracking-wider uppercase">
              idle
            </span>
          </>
        )}
      </div>
    </HudPanel>
  )
}
