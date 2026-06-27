'use client'

import { useState, useEffect } from 'react'
import GlassCard from '@/components/shared/GlassCard'
import Button from '@/components/shared/Button'
import StatusBadge from '@/components/shared/StatusBadge'
import HudPageLayout from '@/components/jarvis/HudPageLayout'

interface Settings {
  gemini_api_key?: string
  gmail_client_id?: string
  gmail_client_secret?: string
  telegram_bot_token?: string
  telegram_chat_id?: string
  default_project_folder?: string
  vscode_command?: string
  db_path?: string
  voice_rate?: number
  voice_pitch?: number
  language?: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [geminiKey, setGeminiKey] = useState('')
  const [gmailClientId, setGmailClientId] = useState('')
  const [gmailClientSecret, setGmailClientSecret] = useState('')
  const [telegramBotToken, setTelegramBotToken] = useState('')
  const [telegramChatId, setTelegramChatId] = useState('')
  const [projectFolder, setProjectFolder] = useState('')
  const [vscodeCommand, setVscodeCommand] = useState('')
  const [voiceRate, setVoiceRate] = useState(1)
  const [voicePitch, setVoicePitch] = useState(1)
  const [language, setLang] = useState('en-US')
  const [gmailConnected, setGmailConnected] = useState(false)
  const [gmailChecking, setGmailChecking] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const connectGmail = async () => {
    try {
      const res = await fetch('/api/gmail/auth')
      const data = await res.json()
      if (data.authUrl) {
        window.location.href = data.authUrl
      } else if (data.loggedIn) {
        setGmailConnected(true)
      }
    } catch {
      setError('Failed to connect Gmail')
    }
  }

  const disconnectGmail = async () => {
    try {
      await fetch('/api/gmail/disconnect', { method: 'POST' })
      setGmailConnected(false)
      setSuccess('Gmail disconnected')
    } catch {
      setError('Failed to disconnect Gmail')
    }
  }

  const GmailStatus = () => {
    if (gmailChecking) return <span className="text-xs font-mono text-hud-muted animate-pulse">Checking...</span>
    return <StatusBadge status={gmailConnected ? 'connected' : 'disconnected'} label={gmailConnected ? 'Connected' : 'Not Connected'} />
  }

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/settings')
      if (!res.ok) throw new Error('Failed to fetch settings')
      const data = await res.json()
      const s = data.settings || data
      setSettings(s)
      setGeminiKey(s.gemini_api_key || '')
      setGmailClientId(s.gmail_client_id || '')
      setGmailClientSecret(s.gmail_client_secret || '')
      setTelegramBotToken(s.telegram_bot_token || '')
      setTelegramChatId(s.telegram_chat_id || '')
      setProjectFolder(s.default_project_folder || '')
      setVscodeCommand(s.vscode_command || '')
      setVoiceRate(s.voice_rate ?? 1)
      setVoicePitch(s.voice_pitch ?? 1)
      setLang(s.language || 'en-US')
      setGmailConnected(s.gmail_logged_in === 'true')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (key: string, payload: Record<string, unknown>) => {
    setSaving(key)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Save failed')
      setSuccess(`${key} saved successfully`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(null)
    }
  }

  const maskKey = (key: string) => {
    if (!key) return ''
    if (key.length <= 8) return '*'.repeat(key.length)
    return key.slice(0, 4) + '*'.repeat(key.length - 8) + key.slice(-4)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background bg-grid-pattern flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary-glow/30 border-t-primary-glow animate-spin" />
      </div>
    )
  }

  return (
    <HudPageLayout title="SETTINGS" subtitle="system configuration">
      {error && (
        <div className="p-3 rounded-lg bg-hud-error/10 border border-hud-error/30">
          <p className="text-xs font-mono text-hud-error">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-hud-success/10 border border-hud-success/30">
          <p className="text-xs font-mono text-hud-success">{success}</p>
        </div>
      )}

      <GlassCard title="Gemini AI">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-hud-muted">API Key</span>
            <StatusBadge status={settings.gemini_api_key ? 'connected' : 'disconnected'} label={settings.gemini_api_key ? 'Configured' : 'Not Set'} />
          </div>
          {settings.gemini_api_key && (
            <p className="text-xs font-mono text-hud-muted/50 font-mono">{maskKey(settings.gemini_api_key)}</p>
          )}
          <div className="flex gap-2">
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="Enter Gemini API Key"
              className="flex-1 rounded-lg border border-panel-border bg-deep-blue/60 px-4 py-2.5 text-sm font-mono text-hud-text placeholder:text-hud-muted/30 outline-none focus:border-primary-glow focus:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all"
            />
            <Button onClick={() => saveSettings('Gemini API', { gemini_api_key: geminiKey })} loading={saving === 'Gemini API'} disabled={!geminiKey.trim()}>
              Save
            </Button>
          </div>
        </div>
      </GlassCard>

      <GlassCard title="Gmail">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-mono text-hud-muted mb-1.5 tracking-wider uppercase">Client ID</label>
            <input
              type="password"
              value={gmailClientId}
              onChange={(e) => setGmailClientId(e.target.value)}
              placeholder="Google OAuth Client ID"
              className="w-full rounded-lg border border-panel-border bg-deep-blue/60 px-4 py-2.5 text-sm font-mono text-hud-text placeholder:text-hud-muted/30 outline-none focus:border-primary-glow focus:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-hud-muted mb-1.5 tracking-wider uppercase">Client Secret</label>
            <input
              type="password"
              value={gmailClientSecret}
              onChange={(e) => setGmailClientSecret(e.target.value)}
              placeholder="Google OAuth Client Secret"
              className="w-full rounded-lg border border-panel-border bg-deep-blue/60 px-4 py-2.5 text-sm font-mono text-hud-text placeholder:text-hud-muted/30 outline-none focus:border-primary-glow focus:shadow-[0_0_12px rgba(0,229,255,0.15)] transition-all"
            />
          </div>
          <Button onClick={() => saveSettings('Gmail', { gmail_client_id: gmailClientId, gmail_client_secret: gmailClientSecret })} loading={saving === 'Gmail'}>
            Save Credentials
          </Button>

          <div className="border-t border-panel-border/30 pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-hud-muted">Gmail Connection</span>
              <GmailStatus />
            </div>
            <div className="flex gap-2">
              <Button onClick={connectGmail} variant="primary" size="sm">
                Connect Gmail
              </Button>
              <Button onClick={disconnectGmail} variant="danger" size="sm">
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard title="Telegram">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-mono text-hud-muted mb-1.5 tracking-wider uppercase">Bot Token</label>
            <input
              type="password"
              value={telegramBotToken}
              onChange={(e) => setTelegramBotToken(e.target.value)}
              placeholder="Telegram Bot Token"
              className="w-full rounded-lg border border-panel-border bg-deep-blue/60 px-4 py-2.5 text-sm font-mono text-hud-text placeholder:text-hud-muted/30 outline-none focus:border-primary-glow focus:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-hud-muted mb-1.5 tracking-wider uppercase">Chat ID</label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              placeholder="Telegram Chat ID"
              className="w-full rounded-lg border border-panel-border bg-deep-blue/60 px-4 py-2.5 text-sm font-mono text-hud-text placeholder:text-hud-muted/30 outline-none focus:border-primary-glow focus:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all"
            />
          </div>
          <Button onClick={() => saveSettings('Telegram', { telegram_bot_token: telegramBotToken, telegram_chat_id: telegramChatId })} loading={saving === 'Telegram'}>
            Save
          </Button>
        </div>
      </GlassCard>

      <GlassCard title="Project & Editor">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-mono text-hud-muted mb-1.5 tracking-wider uppercase">Default Project Folder</label>
            <input
              type="text"
              value={projectFolder}
              onChange={(e) => setProjectFolder(e.target.value)}
              placeholder="/path/to/projects"
              className="w-full rounded-lg border border-panel-border bg-deep-blue/60 px-4 py-2.5 text-sm font-mono text-hud-text placeholder:text-hud-muted/30 outline-none focus:border-primary-glow focus:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-hud-muted mb-1.5 tracking-wider uppercase">VS Code Command</label>
            <input
              type="text"
              value={vscodeCommand}
              onChange={(e) => setVscodeCommand(e.target.value)}
              placeholder="code"
              className="w-full rounded-lg border border-panel-border bg-deep-blue/60 px-4 py-2.5 text-sm font-mono text-hud-text placeholder:text-hud-muted/30 outline-none focus:border-primary-glow focus:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all"
            />
          </div>
          <Button onClick={() => saveSettings('Project', { default_project_folder: projectFolder, vscode_command: vscodeCommand })} loading={saving === 'Project'}>
            Save
          </Button>
        </div>
      </GlassCard>

      <GlassCard title="Database">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-hud-muted">Database Path</span>
          </div>
          <p className="text-xs font-mono text-hud-text/70 bg-deep-blue/40 border border-panel-border/30 rounded-lg px-4 py-2.5">
            {settings.db_path || '/path/to/jarvis.db'}
          </p>
        </div>
      </GlassCard>

      <GlassCard title="Language">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-mono text-hud-muted mb-1.5 tracking-wider uppercase">Assistant Language</label>
            <div className="flex gap-2">
              <select
                value={language}
                onChange={(e) => setLang(e.target.value)}
                className="flex-1 rounded-lg border border-panel-border bg-deep-blue/60 px-4 py-2.5 text-sm font-mono text-hud-text outline-none focus:border-primary-glow focus:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2300E5FF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '20px',
                }}
              >
                <option value="en-US" className="bg-[#0a0e1a]">English (English)</option>
                <option value="ml-IN" className="bg-[#0a0e1a]">Malayalam (മലയാളം)</option>
              </select>
              <Button onClick={() => {
                saveSettings('Language', { language })
                setLang(language)
              }} loading={saving === 'Language'} disabled={language === (settings.language || 'en-US')}>
                Save
              </Button>
            </div>
            <p className="text-[10px] font-mono text-hud-muted/30 mt-1.5 tracking-wider">
              Xena will speak and respond in the selected language
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard title="Voice Settings">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-hud-muted mb-1.5 tracking-wider uppercase">
              Rate: {voiceRate.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceRate}
              onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-deep-blue border border-panel-border/30 cursor-pointer accent-primary-glow [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-glow [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(0,229,255,0.5)]"
            />
            <div className="flex justify-between text-[10px] font-mono text-hud-muted/40 mt-1">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-hud-muted mb-1.5 tracking-wider uppercase">
              Pitch: {voicePitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voicePitch}
              onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-deep-blue border border-panel-border/30 cursor-pointer accent-primary-glow [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-glow [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(0,229,255,0.5)]"
            />
            <div className="flex justify-between text-[10px] font-mono text-hud-muted/40 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
          <Button onClick={() => saveSettings('Voice', { voice_rate: voiceRate, voice_pitch: voicePitch })} loading={saving === 'Voice'}>
            Save
          </Button>
        </div>
      </GlassCard>
    </HudPageLayout>
  )
}
