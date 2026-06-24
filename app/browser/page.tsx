'use client'

import { useState } from 'react'
import GlassCard from '@/components/shared/GlassCard'
import Button from '@/components/shared/Button'
import HudPageLayout from '@/components/jarvis/HudPageLayout'

interface BrowserLog {
  timestamp: string
  action: string
  url: string
  status: 'success' | 'error'
}

export default function BrowserPage() {
  const [googleQuery, setGoogleQuery] = useState('')
  const [youtubeQuery, setYoutubeQuery] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [logs, setLogs] = useState<BrowserLog[]>([])
  const [error, setError] = useState('')

  const performSearch = async (type: 'google' | 'youtube' | 'url', query: string) => {
    setLoading(type)
    setError('')
    try {
      const body: Record<string, string> = {}
      if (type === 'google') body.query = query
      else if (type === 'youtube') body.query = query
      else body.url = query

      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: type === 'google' ? `Search google for ${query}` : type === 'youtube' ? `Search youtube for ${query}` : `Navigate to ${query}` }),
      })
      if (!res.ok) throw new Error(`${type} search failed`)
      const logEntry: BrowserLog = {
        timestamp: new Date().toLocaleTimeString(),
        action: type === 'google' ? 'Google Search' : type === 'youtube' ? 'YouTube Search' : 'Navigate',
        url: query,
        status: 'success',
      }
      setLogs((prev) => [logEntry, ...prev].slice(0, 20))
    } catch (err) {
      setError(err instanceof Error ? err.message : `${type} operation failed`)
      const logEntry: BrowserLog = {
        timestamp: new Date().toLocaleTimeString(),
        action: type === 'google' ? 'Google Search' : type === 'youtube' ? 'YouTube Search' : 'Navigate',
        url: query,
        status: 'error',
      }
      setLogs((prev) => [logEntry, ...prev].slice(0, 20))
    } finally {
      setLoading(null)
    }
  }

  return (
    <HudPageLayout title="BROWSER CONTROL" subtitle="web automation module">
      {error && (
        <div className="p-3 rounded-lg bg-hud-error/10 border border-hud-error/30">
          <p className="text-xs font-mono text-hud-error">{error}</p>
        </div>
      )}

      <GlassCard title="Google Search">
        <div className="flex gap-2">
          <input
            type="text"
            value={googleQuery}
            onChange={(e) => setGoogleQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && performSearch('google', googleQuery)}
            placeholder="Search Google..."
            className="flex-1 rounded-lg border border-panel-border bg-deep-blue/60 px-4 py-2.5 text-sm font-mono text-hud-text placeholder:text-hud-muted/30 outline-none focus:border-primary-glow focus:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all"
          />
          <Button onClick={() => performSearch('google', googleQuery)} loading={loading === 'google'} disabled={!googleQuery.trim()}>
            Search
          </Button>
        </div>
      </GlassCard>

      <GlassCard title="YouTube Search">
        <div className="flex gap-2">
          <input
            type="text"
            value={youtubeQuery}
            onChange={(e) => setYoutubeQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && performSearch('youtube', youtubeQuery)}
            placeholder="Search YouTube..."
            className="flex-1 rounded-lg border border-panel-border bg-deep-blue/60 px-4 py-2.5 text-sm font-mono text-hud-text placeholder:text-hud-muted/30 outline-none focus:border-primary-glow focus:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all"
          />
          <Button onClick={() => performSearch('youtube', youtubeQuery)} loading={loading === 'youtube'} disabled={!youtubeQuery.trim()}>
            Search
          </Button>
        </div>
      </GlassCard>

      <GlassCard title="Navigate to URL">
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && performSearch('url', url)}
            placeholder="https://example.com"
            className="flex-1 rounded-lg border border-panel-border bg-deep-blue/60 px-4 py-2.5 text-sm font-mono text-hud-text placeholder:text-hud-muted/30 outline-none focus:border-primary-glow focus:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all"
          />
          <Button onClick={() => performSearch('url', url)} loading={loading === 'url'} disabled={!url.trim()}>
            Go
          </Button>
        </div>
      </GlassCard>

      <GlassCard title="Browser Logs">
        <div className="max-h-72 overflow-y-auto space-y-2">
          {logs.length === 0 ? (
            <p className="text-xs font-mono text-hud-muted/30 text-center py-4">No browser activity yet</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-deep-blue/40 border border-panel-border/20">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${log.status === 'success' ? 'bg-hud-success shadow-[0_0_4px_rgba(34,197,94,0.6)]' : 'bg-hud-error shadow-[0_0_4px_rgba(251,113,133,0.6)]'}`} />
                  <span className="text-xs font-mono text-hud-text/70 truncate">
                    {log.action}: {log.url}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-hud-muted/40 ml-3">{log.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </HudPageLayout>
  )
}
