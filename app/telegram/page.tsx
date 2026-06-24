'use client'

import { useState, useEffect } from 'react'
import GlassCard from '@/components/shared/GlassCard'
import Button from '@/components/shared/Button'
import StatusBadge from '@/components/shared/StatusBadge'
import HudPageLayout from '@/components/jarvis/HudPageLayout'

interface TelegramLog {
  timestamp: string
  message: string
  status: 'sent' | 'failed'
}

export default function TelegramPage() {
  const [botConfigured, setBotConfigured] = useState(false)
  const [chatIdConfigured, setChatIdConfigured] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [logs, setLogs] = useState<TelegramLog[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        const settings = data.settings || data
        if (settings.telegram_bot_token) setBotConfigured(true)
        if (settings.telegram_chat_id) setChatIdConfigured(true)
      })
      .catch(() => {})
  }, [])

  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      })
      if (!res.ok) throw new Error('Send failed')
      const logEntry: TelegramLog = { timestamp: new Date().toLocaleTimeString(), message: message.trim(), status: 'sent' }
      setLogs((prev) => [logEntry, ...prev].slice(0, 50))
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
      const logEntry: TelegramLog = { timestamp: new Date().toLocaleTimeString(), message: message.trim(), status: 'failed' }
      setLogs((prev) => [logEntry, ...prev].slice(0, 50))
    } finally {
      setSending(false)
    }
  }

  return (
    <HudPageLayout title="TELEGRAM CONTROL" subtitle="messaging interface">
      {error && (
        <div className="p-3 rounded-lg bg-hud-error/10 border border-hud-error/30">
          <p className="text-xs font-mono text-hud-error">{error}</p>
        </div>
      )}

      <GlassCard title="Send Message">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <StatusBadge status={botConfigured ? 'connected' : 'disconnected'} label={botConfigured ? 'Bot Configured' : 'Bot Not Set'} />
            <StatusBadge status={chatIdConfigured ? 'connected' : 'disconnected'} label={chatIdConfigured ? 'Chat ID Set' : 'Chat ID Missing'} />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border border-panel-border bg-deep-blue/60 px-4 py-2.5 text-sm font-mono text-hud-text placeholder:text-hud-muted/30 outline-none focus:border-primary-glow focus:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all"
            />
            <Button onClick={handleSend} loading={sending} disabled={!message.trim()}>
              Send
            </Button>
          </div>
        </div>
      </GlassCard>

      <GlassCard title="Message Logs">
        <div className="max-h-72 overflow-y-auto space-y-2">
          {logs.length === 0 ? (
            <p className="text-xs font-mono text-hud-muted/30 text-center py-4">No messages sent yet</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-deep-blue/40 border border-panel-border/20">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${log.status === 'sent' ? 'bg-hud-success shadow-[0_0_4px_rgba(34,197,94,0.6)]' : 'bg-hud-error shadow-[0_0_4px_rgba(251,113,133,0.6)]'}`} />
                  <span className="text-xs font-mono text-hud-text/70 truncate">{log.message}</span>
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
