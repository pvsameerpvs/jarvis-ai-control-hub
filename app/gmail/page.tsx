'use client'

import { useState } from 'react'
import GlassCard from '@/components/shared/GlassCard'
import Button from '@/components/shared/Button'
import StatusBadge from '@/components/shared/StatusBadge'
import BottomDock from '@/components/jarvis/BottomDock'

interface Email {
  id: string
  from: string
  subject: string
  snippet: string
  date: string
}

export default function GmailPage() {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [todayCount, setTodayCount] = useState<number | null>(null)
  const [unreadCount, setUnreadCount] = useState<number | null>(null)
  const [emails, setEmails] = useState<Email[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Email[]>([])
  const [summarizing, setSummarizing] = useState(false)
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState<'counts' | 'emails' | null>(null)
  const [error, setError] = useState('')

  const handleConnect = async () => {
    setConnecting(true)
    setError('')
    try {
      setConnected(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setConnecting(false)
    }
  }

  const fetchCounts = async () => {
    setLoading('counts')
    setError('')
    try {
      const res = await fetch('/api/gmail/count')
      if (res.ok) {
        const data = await res.json()
        setTodayCount(data.todayCount ?? null)
        setUnreadCount(data.unreadCount ?? null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch counts')
    } finally {
      setLoading(null)
    }
  }

  const fetchLatestEmails = async () => {
    setLoading('emails')
    setError('')
    try {
      const res = await fetch('/api/gmail/latest')
      if (!res.ok) throw new Error('Failed to fetch emails')
      const data = await res.json()
      setEmails(data.emails || data.messages || data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emails')
    } finally {
      setLoading(null)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setLoading('emails')
    setError('')
    try {
      const res = await fetch(`/api/gmail/search?q=${encodeURIComponent(searchQuery)}`)
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setSearchResults(data.emails || data.messages || data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(null)
    }
  }

  const handleSummarize = async () => {
    setSummarizing(true)
    setError('')
    setSummary('')
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'Summarize today emails' }),
      })
      if (!res.ok) throw new Error('Summarization failed')
      const data = await res.json()
      setSummary(data.response || data.message || JSON.stringify(data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Summarization failed')
    } finally {
      setSummarizing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <div className="relative z-10 min-h-screen flex flex-col pb-24">
        <header className="flex items-center justify-between px-6 py-4 border-b border-panel-border/30">
          <h1 className="text-lg font-mono text-primary-glow font-bold tracking-[0.15em] text-glow">
            GMAIL INTEGRATION
          </h1>
          <StatusBadge status={connected ? 'connected' : 'disconnected'} label={connected ? 'Connected' : 'Disconnected'} />
        </header>

        <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full space-y-6">
          {!connected && (
            <GlassCard title="Gmail OAuth">
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm font-mono text-hud-muted/70 text-center">
                  Connect your Google account to enable Gmail integration
                </p>
                <Button onClick={handleConnect} loading={connecting}>
                  Connect Gmail
                </Button>
              </div>
            </GlassCard>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-hud-error/10 border border-hud-error/30">
              <p className="text-xs font-mono text-hud-error">{error}</p>
            </div>
          )}

          {connected && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassCard title="Today's Mail">
                  <p className="text-3xl font-mono text-primary-glow font-bold text-glow-sm">
                    {todayCount !== null ? todayCount : '---'}
                  </p>
                  <Button onClick={fetchCounts} size="sm" loading={loading === 'counts'} className="mt-3">
                    Refresh Count
                  </Button>
                </GlassCard>
                <GlassCard title="Unread Mail">
                  <p className="text-3xl font-mono text-hud-warning font-bold text-glow-sm">
                    {unreadCount !== null ? unreadCount : '---'}
                  </p>
                  <Button onClick={fetchCounts} size="sm" loading={loading === 'counts'} className="mt-3">
                    Refresh Count
                  </Button>
                </GlassCard>
              </div>

              <GlassCard title="Search Email">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search emails..."
                    className="flex-1 rounded-lg border border-panel-border bg-deep-blue/60 px-4 py-2.5 text-sm font-mono text-hud-text placeholder:text-hud-muted/30 outline-none focus:border-primary-glow focus:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all"
                  />
                  <Button onClick={handleSearch} loading={loading === 'emails'}>
                    Search
                  </Button>
                </div>
              </GlassCard>

              <GlassCard title="Latest 10 Emails">
                <div className="space-y-2">
                  <Button onClick={fetchLatestEmails} size="sm" loading={loading === 'emails'}>
                    Fetch Latest
                  </Button>
                  <div className="max-h-72 overflow-y-auto space-y-2 mt-3">
                    {(searchResults.length > 0 ? searchResults : emails).map((email, i) => (
                      <div key={email.id || i} className="p-3 rounded-lg bg-deep-blue/40 border border-panel-border/30">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-primary-glow/70 truncate">{email.from}</span>
                          <span className="text-[10px] font-mono text-hud-muted/40">{email.date}</span>
                        </div>
                        <p className="text-xs font-mono text-hud-text/80 truncate">{email.subject}</p>
                        <p className="text-[11px] font-mono text-hud-muted/50 mt-1 line-clamp-2">{email.snippet}</p>
                      </div>
                    ))}
                    {(searchResults.length === 0 && emails.length === 0) && (
                      <p className="text-xs font-mono text-hud-muted/30 text-center py-4">No emails loaded</p>
                    )}
                  </div>
                </div>
              </GlassCard>

              <GlassCard title="Summarize Today's Emails">
                <div className="space-y-3">
                  <Button onClick={handleSummarize} loading={summarizing}>
                    Generate Summary
                  </Button>
                  {summary && (
                    <div className="p-4 rounded-lg bg-primary-glow/5 border border-primary-glow/20">
                      <p className="text-sm font-mono text-hud-text/90 leading-relaxed whitespace-pre-wrap">{summary}</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </>
          )}
        </main>
      </div>

      <BottomDock />
    </div>
  )
}
