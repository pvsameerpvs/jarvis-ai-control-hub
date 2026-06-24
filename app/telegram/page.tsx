'use client'

import { useState, useEffect } from 'react'
import GlassCard from '@/components/shared/GlassCard'
import Button from '@/components/shared/Button'
import StatusBadge from '@/components/shared/StatusBadge'
import BottomDock from '@/components/jarvis/BottomDock'

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

  const sendMessage = async (text: string) => {
    setError('')
    setSending(true)
    try {
      const res = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      if (!res.ok) throw new Error('Send failed')
      const data = await res.json()
      const logSent: TelegramLog = { timestamp: new Date().toLocaleTimeString(), message: text, status: 'sent' }
      setLogs((prev) => [logSent, ...prev].slice(0, 50))
      return data
    } catch (err) {
      const logFailed: TelegramLog = { timestamp: new Date().toLocaleTimeString(), message: text, status: 'failed' }
      setLogs((prev) => [logFailed, ...prev].slice(0, 50))
      throw err
    } finally {
      setSending(false)
    }
  }

  const handleSendTest = async () => {
    try {
      await sendMessage('Test from J.A.R.V.I.S')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send test message')
    }
  }

  const handleSendReport = async () => {
    setError('')
    try {
      const reportMessage = `J.A.R.V.I.S Daily Report - ${new Date().toLocaleDateString()}\n\nSystem Status: Online\nAll subsystems operational.`
      const res = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reportMessage }),
      })
      if (!res.ok) throw new Error('Report failed')
      const reportSent: TelegramLog = { timestamp: new Date().toLocaleTimeString(), message: 'Today summary report sent', status: 'sent' }
      setLogs((prev) => [reportSent, ...prev].slice(0, 50))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send report')
      const reportFailed: TelegramLog = { timestamp: new Date().toLocaleTimeString(), message: 'Today summary report', status: 'failed' }
      setLogs((prev) => [reportFailed, ...prev].slice(0, 50))
    }
  }

  const handleSendCustom = async () => {
    if (!message.trim()) return
    try {
      await sendMessage(message.trim())
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    }
  }

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <div className="relative z-10 min-h-screen flex flex-col pb-24">
        <header className="flex items-center justify-between px-6 py-4 border-b border-panel-border/30">
          <h1 className="text-lg font-mono text-primary-glow font-bold tracking-[0.15em] text-glow">
            TELEGRAM CONTROL
          </h1>
        </header>

        <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassCard title="Bot Token">
              <StatusBadge status={botConfigured ? 'connected' : 'disconnected'} label={botConfigured ? 'Configured' : 'Not Configured'} />
              {!botConfigured && (
                <p className="text-xs font-mono text-hud-muted/50 mt-2">Set bot token in Settings</p>
              )}
            </GlassCard>
            <GlassCard title="Chat ID">
              <StatusBadge status={chatIdConfigured ? 'connected' : 'disconnected'} label={chatIdConfigured ? 'Configured' : 'Not Configured'} />
              {!chatIdConfigured && (
                <p className="text-xs font-mono text-hud-muted/50 mt-2">Set Chat ID in Settings</p>
              )}
            </GlassCard>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-hud-error/10 border border-hud-error/30">
              <p className="text-xs font-mono text-hud-error">{error}</p>
            </div>
          )}

          <GlassCard title="Send Message">
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendCustom()}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-panel-border bg-deep-blue/60 px-4 py-2.5 text-sm font-mono text-hud-text placeholder:text-hud-muted/30 outline-none focus:border-primary-glow focus:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all"
                />
                <Button onClick={handleSendCustom} loading={sending} disabled={!message.trim()}>
                  Send
                </Button>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSendTest} loading={sending} variant="secondary" size="sm">
                  Send Test Message
                </Button>
                <Button onClick={handleSendReport} loading={sending} variant="secondary" size="sm">
                  Send Report
                </Button>
              </div>
            </div>
          </GlassCard>

          <GlassCard title="Telegram Logs">
            <div className="max-h-60 overflow-y-auto space-y-2">
              {logs.length === 0 ? (
                <p className="text-xs font-mono text-hud-muted/30 text-center py-4">No messages sent yet</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-deep-blue/40 border border-panel-border/20">
                    <div className="flex items-center gap-2 min-w-0">
                      <StatusBadge status={log.status === 'sent' ? 'connected' : 'disconnected'} />
                      <span className="text-xs font-mono text-hud-text/70 truncate">{log.message}</span>
                    </div>
                    <span className="text-[10px] font-mono text-hud-muted/40 shrink-0">{log.timestamp}</span>
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
