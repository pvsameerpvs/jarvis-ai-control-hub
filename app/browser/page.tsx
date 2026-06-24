'use client'

import { useState } from 'react'
import GlassCard from '@/components/shared/GlassCard'
import Button from '@/components/shared/Button'
import BottomDock from '@/components/jarvis/BottomDock'

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

      const res = await fetch('/api/browser/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...body }),
      })
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      const newLog: BrowserLog = { timestamp: new Date().toLocaleTimeString(), action: `Open ${type}`, url: query, status: 'success' }
      setLogs((prev) => [newLog, ...prev].slice(0, 50))
      return data
    } catch (err) {
      const errLog: BrowserLog = { timestamp: new Date().toLocaleTimeString(), action: `Open ${type}`, url: query, status: 'error' }
      setLogs((prev) => [errLog, ...prev].slice(0, 50))
      throw err
    } finally {
      setLoading(null)
    }
  }

  const handleGoogleSearch = async () => {
    if (!googleQuery.trim()) return
    try {
      await performSearch('google', googleQuery.trim())
      setGoogleQuery('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open Google search')
    }
  }

  const handleYoutubeSearch = async () => {
    if (!youtubeQuery.trim()) return
    try {
      await performSearch('youtube', youtubeQuery.trim())
      setYoutubeQuery('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open YouTube search')
    }
  }

  const handleOpenUrl = async () => {
    if (!url.trim()) return
    let targetUrl = url.trim()
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl
    }
    try {
      await performSearch('url', targetUrl)
      setUrl('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open URL')
    }
  }

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <div className="relative z-10 min-h-screen flex flex-col pb-24">
        <header className="flex items-center justify-between px-6 py-4 border-b border-panel-border/30">
          <h1 className="text-lg font-mono text-primary-glow font-bold tracking-[0.15em] text-glow">
            BROWSER CONTROL
          </h1>
        </header>

        <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-hud-error/10 border border-hud-error/30">
              <p className="text-xs font-mono text-hud-error">{error}</p>
            </div>
          )}

          <GlassCard title="Open Google Search">
            <div className="flex gap-2">
              <input
                type="text"
                value={googleQuery}
                onChange={(e) => setGoogleQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGoogleSearch()}
                placeholder="Search Google..."
                className="flex-1 rounded-lg border border-panel-border bg-deep-blue/60 px-4 py-2.5 text-sm font-mono text-hud-text placeholder:text-hud-muted/30 outline-none focus:border-primary-glow focus:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all"
              />
              <Button onClick={handleGoogleSearch} loading={loading === 'google'} disabled={!googleQuery.trim()}>
                Search
              </Button>
            </div>
          </GlassCard>

          <GlassCard title="Open YouTube Search">
            <div className="flex gap-2">
              <input
                type="text"
                value={youtubeQuery}
                onChange={(e) => setYoutubeQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleYoutubeSearch()}
                placeholder="Search YouTube..."
                className="flex-1 rounded-lg border border-panel-border bg-deep-blue/60 px-4 py-2.5 text-sm font-mono text-hud-text placeholder:text-hud-muted/30 outline-none focus:border-primary-glow focus:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all"
              />
              <Button onClick={handleYoutubeSearch} loading={loading === 'youtube'} disabled={!youtubeQuery.trim()}>
                Search
              </Button>
            </div>
          </GlassCard>

          <GlassCard title="Open Website">
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleOpenUrl()}
                placeholder="https://example.com"
                className="flex-1 rounded-lg border border-panel-border bg-deep-blue/60 px-4 py-2.5 text-sm font-mono text-hud-text placeholder:text-hud-muted/30 outline-none focus:border-primary-glow focus:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all"
              />
              <Button onClick={handleOpenUrl} loading={loading === 'url'} disabled={!url.trim()}>
                Open
              </Button>
            </div>
          </GlassCard>

          <GlassCard title="Browser Actions Log">
            <div className="max-h-60 overflow-y-auto space-y-2">
              {logs.length === 0 ? (
                <p className="text-xs font-mono text-hud-muted/30 text-center py-4">No browser actions yet</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-deep-blue/40 border border-panel-border/20">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${log.status === 'success' ? 'bg-hud-success shadow-[0_0_4px_rgba(34,197,94,0.6)]' : 'bg-hud-error shadow-[0_0_4px_rgba(251,113,133,0.6)]'}`} />
                      <span className="text-xs font-mono text-hud-text/70">{log.action}</span>
                      <span className="text-[10px] font-mono text-hud-muted/50 truncate max-w-[200px]">{log.url}</span>
                    </div>
                    <span className="text-[10px] font-mono text-hud-muted/40">{log.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </main>
      </div>

      <BottomDock />
    </div>
  )
}
