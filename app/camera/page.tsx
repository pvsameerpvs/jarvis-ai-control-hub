'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import CameraPreview, { type CameraPreviewHandle } from '@/components/jarvis/CameraPreview'
import BottomDock from '@/components/jarvis/BottomDock'

function TimeDisplay() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString())
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])
  return <span className="text-[10px] font-mono text-primary-glow/40 tracking-wider">{time}</span>
}

function Waveform({ active, speaking }: { active: boolean; speaking: boolean }) {
  const bars = 40
  return (
    <div className="flex items-center gap-[2px] h-8">
      {Array.from({ length: bars }).map((_, i) => {
        const center = bars / 2
        const dist = Math.abs(i - center) / center
        const height = active
          ? speaking
            ? 20 + Math.sin(i * 0.8 + Date.now() * 0.005) * 18 + Math.random() * 10
            : 12 + Math.sin(i * 0.5 + Date.now() * 0.003) * 8 + Math.random() * 4
          : 3 + Math.sin(i * 0.3) * 2
        return (
          <div
            key={i}
            className={`w-[3px] rounded-full transition-all duration-75 ${
              speaking ? 'bg-primary-glow/70' : active ? 'bg-primary-glow/40' : 'bg-primary-glow/15'
            }`}
            style={{ height: `${Math.max(2, height)}px` }}
          />
        )
      })}
    </div>
  )
}

interface ChatMessage {
  id: string
  role: 'user' | 'jarvis'
  text: string
  time: string
}

export default function CameraPage() {
  const cameraRef = useRef<CameraPreviewHandle>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [question, setQuestion] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'streaming' | 'captured' | 'error'>('idle')
  const [liveMode, setLiveMode] = useState(false)
  const [conversation, setConversation] = useState<ChatMessage[]>([])
  const autoStartDoneRef = useRef(false)
  const waveformActive = cameraStatus === 'streaming' || cameraStatus === 'captured'

  useEffect(() => {
    if (autoStartDoneRef.current) return
    if (typeof window !== 'undefined' && cameraStatus === 'idle') {
      autoStartDoneRef.current = true
      handleStartCamera()
    }
  }, [cameraStatus])

  const addMessage = useCallback((role: 'user' | 'jarvis', text: string) => {
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role,
      text,
      time: new Date().toLocaleTimeString(),
    }
    setConversation(prev => [...prev.slice(-19), msg])
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation])

  const handleStatusChange = useCallback((status: 'idle' | 'streaming' | 'captured' | 'error') => {
    setCameraStatus(status)
    if (status === 'idle') {
      setLiveMode(false)
    }
  }, [])

  const handleCapture = useCallback((_base64: string) => {
    setCameraStatus('captured')
  }, [])

  const handleStartCamera = async () => {
    await cameraRef.current?.startCamera()
  }

  const handleCaptureFrame = () => {
    cameraRef.current?.captureFrame()
  }

  const handleRetake = () => {
    cameraRef.current?.retake()
  }

  const handleReset = () => {
    cameraRef.current?.reset()
    setConversation([])
  }

  const sendForAnalysis = useCallback(async (imageBase64: string, userQuestion?: string): Promise<string> => {
    const res = await fetch('/api/camera/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64,
        ...(userQuestion ? { question: userQuestion } : {}),
      }),
    })
    if (!res.ok) {
      const errData = await res.json().catch(() => null)
      throw new Error(errData?.error || `API error: ${res.status}`)
    }
    const data = await res.json()
    return data.response || data.message || ''
  }, [])

  const handleAnalyze = async () => {
    if (!question.trim()) return

    let img = cameraRef.current?.capturedImage
    if (!img && cameraStatus === 'streaming') {
      img = cameraRef.current?.getCurrentFrame() ?? null
    }
    if (!img) return

    const q = question.trim()
    setQuestion('')
    addMessage('user', q)
    setAnalyzing(true)

    try {
      const text = await sendForAnalysis(img, q)
      addMessage('jarvis', text)
    } catch (err) {
      addMessage('jarvis', `Error: ${err instanceof Error ? err.message : 'Analysis failed'}`)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSpeak = (text: string) => {
    if (!text || typeof window === 'undefined') return
    const synth = window.speechSynthesis
    if (synth.speaking) {
      synth.cancel()
      setSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    setSpeaking(true)
    synth.speak(utterance)
  }

  // Live auto-analysis when streaming
  useEffect(() => {
    if (cameraStatus !== 'streaming') {
      setLiveMode(false)
      return
    }

    setLiveMode(true)
    let active = true
    let intervalId: ReturnType<typeof setInterval> | null = null

    const initialQuestion = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('q') || ''
      : ''

    const tick = async () => {
      if (!active) return
      const img = cameraRef.current?.getCurrentFrame()
      if (!img) return
      try {
        const text = await sendForAnalysis(img, initialQuestion || undefined)
        if (active) {
          addMessage('jarvis', text)
          if (typeof window !== 'undefined' && 'speechSynthesis' in window && !window.speechSynthesis.speaking) {
            const u = new SpeechSynthesisUtterance(text)
            u.rate = 1.0
            u.pitch = 0.9
            window.speechSynthesis.speak(u)
          }
        }
      } catch {
        // silent retry next tick
      }
    }

    const startTimeout = setTimeout(() => {
      tick()
      intervalId = setInterval(tick, 10000)
    }, 2000)

    return () => {
      active = false
      clearTimeout(startTimeout)
      if (intervalId) clearInterval(intervalId)
    }
  }, [cameraStatus, sendForAnalysis, addMessage])

  const isActive = cameraStatus === 'streaming' || cameraStatus === 'captured'

  return (
    <div className="h-screen bg-background overflow-hidden relative">
      <CameraPreview ref={cameraRef} onCapture={handleCapture} onStatusChange={handleStatusChange} />

      <div className="fixed inset-0 pointer-events-none z-[2] opacity-[0.008]
        bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,229,255,0.03)_2px,rgba(0,229,255,0.03)_4px)]" />

      {/* === TOP HUD BAR === */}
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="h-px bg-gradient-to-r from-transparent via-primary-glow/30 to-transparent shadow-[0_0_8px_rgba(0,229,255,0.1)]" />
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#0a0e1a]/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-[2px] h-5 bg-primary-glow rounded-full shadow-[0_0_8px_rgba(0,229,255,0.3)]" />
              <h1 className="text-sm font-mono text-primary-glow font-bold tracking-[0.15em] drop-shadow-[0_0_12px_rgba(0,229,255,0.2)]">
                VISION SCANNER
              </h1>
            </div>
            <span className="text-[9px] font-mono text-primary-glow/30 tracking-[0.2em] uppercase border-l border-primary-glow/15 pl-4">
              live video analysis
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[9px] font-mono text-primary-glow/40 uppercase tracking-wider">
              <span className={`w-1.5 h-1.5 rounded-full ${
                isActive ? 'bg-primary-glow shadow-[0_0_6px_rgba(0,229,255,0.6)] animate-pulse' : 'bg-primary-glow/30'
              }`} />
              {isActive ? (liveMode ? 'watching' : 'online') : 'standby'}
            </span>
            <TimeDisplay />
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-primary-glow/15 to-transparent" />
      </header>

      {/* === LEFT DIAGNOSTIC PANEL === */}
      <div className="absolute top-16 left-4 z-20 w-[200px] pointer-events-none">
        <div className="rounded-xl border border-primary-glow/15 bg-[#0a0e1a]/40 backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-px h-3 bg-primary-glow/40" />
            <span className="text-[9px] font-mono text-primary-glow/50 tracking-[0.15em] uppercase">Diagnostics</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-hud-muted/40">STATUS</span>
              <span className={`text-[9px] font-mono ${isActive ? 'text-hud-success' : 'text-hud-muted/30'}`}>
                {isActive ? 'ACTIVE' : 'STANDBY'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-hud-muted/40">FOV</span>
              <span className="text-[9px] font-mono text-hud-text/60">60°</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-hud-muted/40">RESOLUTION</span>
              <span className="text-[9px] font-mono text-hud-text/60">640×480</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-hud-muted/40">FPS</span>
              <span className="text-[9px] font-mono text-hud-text/60">{isActive ? '30' : '--'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-hud-muted/40">LUX</span>
              <span className="text-[9px] font-mono text-hud-text/60">{isActive ? '320' : '--'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-hud-muted/40">MODE</span>
              <span className={`text-[9px] font-mono ${liveMode ? 'text-primary-glow' : 'text-hud-text/60'}`}>
                {liveMode ? 'LIVE CONVERSATION' : isActive ? 'MANUAL' : '--'}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-primary-glow/10">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-hud-success shadow-[0_0_6px_rgba(34,197,94,0.5)]' : 'bg-hud-muted/20'}`} />
              <span className="text-[8px] font-mono text-hud-muted/30 tracking-wider">
                {liveMode ? 'XENA is watching' : isActive ? 'awaiting input' : 'AWAITING ACTIVATION'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* === RIGHT CHAT PANEL — live video call feel === */}
      <div className="absolute top-16 right-4 z-20 w-[280px] bottom-24 flex flex-col">
        <div className="flex-1 rounded-xl border border-primary-glow/15 bg-[#0a0e1a]/40 backdrop-blur-sm flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-primary-glow/10 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-px h-3 bg-primary-glow/40" />
              <span className="text-[9px] font-mono text-primary-glow/50 tracking-[0.15em] uppercase">XENA</span>
            </div>
            {liveMode && (
              <span className="flex items-center gap-1.5 text-[8px] font-mono text-primary-glow/60 tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-glow shadow-[0_0_6px_rgba(0,229,255,0.6)] animate-pulse" />
                Watching
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 min-h-0">
            {conversation.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                {isActive ? (
                  <>
                    <div className="w-10 h-10 rounded-full border border-primary-glow/20 flex items-center justify-center mb-3">
                      <span className="text-lg text-primary-glow/30">◉</span>
                    </div>
                    <p className="text-[10px] font-mono text-hud-muted/20 leading-relaxed max-w-[200px]">
                      {liveMode
                        ? 'XENA is watching the live feed. Descriptions will appear here automatically.'
                        : 'Camera is live. Ask a question to start the conversation.'}
                    </p>
                  </>
                ) : (
                  <p className="text-[10px] font-mono text-hud-muted/20">Start the camera to begin.</p>
                )}
              </div>
            )}

            {conversation.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center ${
                  msg.role === 'jarvis'
                    ? 'bg-primary-glow/10 border border-primary-glow/25'
                    : 'bg-[#020617]/60 border border-hud-muted/20'
                }`}>
                  <span className="text-[8px]">{msg.role === 'jarvis' ? 'J' : 'U'}</span>
                </div>
                {/* Bubble */}
                <div className={`max-w-[85%] rounded-lg px-2.5 py-1.5 ${
                  msg.role === 'jarvis'
                    ? 'bg-primary-glow/[0.06] border border-primary-glow/15'
                    : 'bg-[#020617]/60 border border-hud-muted/15'
                }`}>
                  <p className="text-[10px] font-mono text-hud-text/80 leading-relaxed whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[7px] font-mono text-hud-muted/20">{msg.time}</span>
                    {msg.role === 'jarvis' && msg.text.length > 10 && (
                      <button
                        onClick={() => handleSpeak(msg.text)}
                        className="text-[7px] font-mono text-primary-glow/30 hover:text-primary-glow/60 transition-colors"
                      >
                        ♪
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Analyzing indicator */}
            {analyzing && (
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center bg-primary-glow/10 border border-primary-glow/25">
                  <span className="text-[8px]">J</span>
                </div>
                <div className="max-w-[85%] rounded-lg px-2.5 py-2 bg-primary-glow/[0.04] border border-primary-glow/10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-glow/50 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-glow/30 animate-pulse animate-delay-200" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-glow/20 animate-pulse animate-delay-400" />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-primary-glow/10 p-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder={isActive ? 'Ask about what XENA sees...' : 'Start camera first...'}
                className="flex-1 rounded-lg border border-primary-glow/20 bg-[#020617]/60 px-2.5 py-1.5 text-[10px] font-mono text-hud-text/80 placeholder:text-hud-muted/15 outline-none focus:border-primary-glow/40 focus:shadow-[0_0_10px_rgba(0,229,255,0.08)] transition-all"
              />
              <button
                onClick={handleAnalyze}
                disabled={!question.trim() || analyzing || !isActive}
                className="px-3 py-1.5 rounded-lg bg-primary-glow/10 border border-primary-glow/25 text-[9px] font-mono text-primary-glow/80 tracking-wider uppercase
                  hover:bg-primary-glow/20 hover:border-primary-glow/40
                  disabled:opacity-25 disabled:cursor-not-allowed
                  transition-all duration-300 shrink-0"
              >
                {analyzing ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full border border-primary-glow/60 border-t-transparent animate-spin" />
                  </span>
                ) : 'Ask'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* === BOTTOM CONTROLS + WAVEFORM === */}
      <div className="absolute bottom-16 left-0 right-0 z-20 flex flex-col items-center gap-3 px-4">
        <div className="flex items-center gap-4 px-6 py-2 rounded-xl border border-primary-glow/10 bg-[#0a0e1a]/30 backdrop-blur-sm">
          <span className="text-[8px] font-mono text-primary-glow/30 tracking-[0.15em] uppercase">Freq</span>
          <Waveform active={waveformActive} speaking={speaking} />
          <span className="text-[8px] font-mono text-primary-glow/30 tracking-[0.15em] uppercase">
            {speaking ? 'Vocal' : isActive ? 'Signal' : 'Idle'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {cameraStatus === 'streaming' && (
            <>
              <button onClick={handleCaptureFrame}
                className="group relative px-8 py-2.5 rounded-lg bg-primary-glow/8 border border-primary-glow/25 text-xs font-mono text-primary-glow/90 tracking-[0.2em] uppercase
                  hover:bg-primary-glow/15 hover:border-primary-glow/40 hover:shadow-[0_0_25px_rgba(0,229,255,0.12)]
                  transition-all duration-300">
                <span className="relative z-10 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full border-2 border-primary-glow/70" />
                  Capture Frame
                </span>
              </button>
              <button onClick={handleReset}
                className="px-5 py-2.5 rounded-lg border border-hud-muted/15 text-xs font-mono text-hud-muted/40 tracking-[0.15em] uppercase
                  hover:border-hud-muted/30 hover:text-hud-muted/60 transition-all duration-300">
                Stop
              </button>
            </>
          )}

          {cameraStatus === 'captured' && (
            <>
              <button onClick={handleRetake}
                className="group relative px-8 py-2.5 rounded-lg bg-primary-glow/8 border border-primary-glow/25 text-xs font-mono text-primary-glow/90 tracking-[0.2em] uppercase
                  hover:bg-primary-glow/15 hover:border-primary-glow/40 hover:shadow-[0_0_25px_rgba(0,229,255,0.12)]
                  transition-all duration-300">
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-sm">◉</span>
                  Retake
                </span>
              </button>
              <button onClick={handleReset}
                className="px-5 py-2.5 rounded-lg border border-hud-muted/15 text-xs font-mono text-hud-muted/40 tracking-[0.15em] uppercase
                  hover:border-hud-muted/30 hover:text-hud-muted/60 transition-all duration-300">
                Clear
              </button>
            </>
          )}

          {cameraStatus === 'error' && (
            <button onClick={handleStartCamera}
              className="px-8 py-2.5 rounded-lg bg-hud-error/8 border border-hud-error/25 text-xs font-mono text-hud-error/80 tracking-[0.2em] uppercase
                hover:bg-hud-error/15 transition-all duration-300">
              ◉ Retry
            </button>
          )}
        </div>
      </div>

      <BottomDock />
    </div>
  )
}
