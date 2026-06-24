'use client'

import { useState } from 'react'
import CameraPreview from '@/components/jarvis/CameraPreview'
import GlassCard from '@/components/shared/GlassCard'
import Button from '@/components/shared/Button'
import BottomDock from '@/components/jarvis/BottomDock'

interface VisionLog {
  timestamp: string
  question: string
  response: string
}

export default function CameraPage() {
  const [question, setQuestion] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [error, setError] = useState('')
  const [visionLogs, setVisionLogs] = useState<VisionLog[]>([])
  const [speaking, setSpeaking] = useState(false)

  const handleAnalyze = async () => {
    if (!question.trim()) return
    setAnalyzing(true)
    setError('')
    setAiResponse('')

    try {
      const res = await fetch('/api/camera/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      })

      if (!res.ok) throw new Error(`API error: ${res.status}`)

      const data = await res.json()
      const responseText = data.response || data.message || JSON.stringify(data)
      setAiResponse(responseText)
      const logEntry: VisionLog = { timestamp: new Date().toLocaleTimeString(), question: question.trim(), response: responseText }
      setVisionLogs((prev) => [logEntry, ...prev].slice(0, 20))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSpeak = () => {
    if (!aiResponse || typeof window === 'undefined') return
    const synth = window.speechSynthesis
    if (synth.speaking) {
      synth.cancel()
      setSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(aiResponse)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    setSpeaking(true)
    synth.speak(utterance)
  }

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <div className="relative z-10 min-h-screen flex flex-col pb-24">
        <header className="flex items-center justify-between px-6 py-4 border-b border-panel-border/30">
          <h1 className="text-lg font-mono text-primary-glow font-bold tracking-[0.15em] text-glow">
            CAMERA VISION
          </h1>
        </header>

        <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full space-y-6">
          <CameraPreview />

          <GlassCard title="Image Analysis">
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="What do you want to know about the image?"
                  className="flex-1 rounded-lg border border-panel-border bg-deep-blue/60 px-4 py-2.5 text-sm font-mono text-hud-text placeholder:text-hud-muted/30 outline-none focus:border-primary-glow focus:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all"
                />
                <Button onClick={handleAnalyze} loading={analyzing} disabled={!question.trim()}>
                  Ask
                </Button>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-hud-error/10 border border-hud-error/30">
                  <p className="text-xs font-mono text-hud-error">{error}</p>
                </div>
              )}

              {aiResponse && (
                <div className="p-4 rounded-lg bg-primary-glow/5 border border-primary-glow/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-hud-muted/60 tracking-widest uppercase">
                      J.A.R.V.I.S Analysis
                    </span>
                    <Button onClick={handleSpeak} size="sm" variant="secondary">
                      {speaking ? 'Stop' : 'Speak Response'}
                    </Button>
                  </div>
                  <p className="text-sm font-mono text-hud-text/90 leading-relaxed">{aiResponse}</p>
                </div>
              )}
            </div>
          </GlassCard>

          {visionLogs.length > 0 && (
            <GlassCard title="Vision Logs">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {visionLogs.map((log, i) => (
                  <div key={i} className="p-3 rounded-lg bg-deep-blue/40 border border-panel-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-hud-muted/40">{log.timestamp}</span>
                    </div>
                    <p className="text-xs font-mono text-hud-muted/70 mb-1">
                      Q: {log.question}
                    </p>
                    <p className="text-xs font-mono text-hud-text/60">
                      A: {log.response}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </main>
      </div>

      <BottomDock />
    </div>
  )
}
