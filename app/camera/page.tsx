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

export default function CameraPage() {
  const cameraRef = useRef<CameraPreviewHandle>(null)
  const [question, setQuestion] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [error, setError] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const [showResponse, setShowResponse] = useState(false)
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'streaming' | 'captured' | 'error'>('idle')
  const waveformActive = cameraStatus === 'streaming' || cameraStatus === 'captured'

  const handleStatusChange = useCallback((status: 'idle' | 'streaming' | 'captured' | 'error') => {
    setCameraStatus(status)
    if (status === 'idle') {
      setAiResponse('')
      setError('')
      setShowResponse(false)
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
  }

  const handleAnalyze = async () => {
    if (!question.trim()) return
    const img = cameraRef.current?.capturedImage
    if (!img) return

    setAnalyzing(true)
    setError('')
    setAiResponse('')
    setShowResponse(true)

    try {
      const res = await fetch('/api/camera/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: img, question: question.trim() }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error || `API error: ${res.status}`)
      }
      const data = await res.json()
      setAiResponse(data.response || data.message || JSON.stringify(data))
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

  const isActive = cameraStatus === 'streaming' || cameraStatus === 'captured'
  const isCaptured = cameraStatus === 'captured'

  return (
    <div className="h-screen bg-background overflow-hidden relative">
      {/* Camera background + scanner HUD */}
      <CameraPreview ref={cameraRef} onCapture={handleCapture} onStatusChange={handleStatusChange} />

      {/* Scan lines overlay */}
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
              advanced analysis system
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[9px] font-mono text-primary-glow/40 uppercase tracking-wider">
              <span className={`w-1.5 h-1.5 rounded-full ${
                isActive ? 'bg-primary-glow shadow-[0_0_6px_rgba(0,229,255,0.6)] animate-pulse' : 'bg-primary-glow/30'
              }`} />
              {isActive ? 'neural link active' : 'standby'}
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
              <span className="text-[9px] font-mono text-hud-muted/40">IR MODE</span>
              <span className="text-[9px] font-mono text-hud-text/60">OFF</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-hud-muted/40">ZOOM</span>
              <span className="text-[9px] font-mono text-hud-text/60">1.0×</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-hud-muted/40">BUFFER</span>
              <span className="text-[9px] font-mono text-hud-text/60">{isCaptured ? 'LOCKED' : isActive ? 'STREAM' : '--'}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-primary-glow/10">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-hud-success shadow-[0_0_6px_rgba(34,197,94,0.5)]' : 'bg-hud-muted/20'}`} />
              <span className="text-[8px] font-mono text-hud-muted/30 tracking-wider">
                {isActive ? 'ALL SYSTEMS NOMINAL' : 'AWAITING ACTIVATION'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* === RIGHT AI ANALYSIS PANEL === */}
      <div className="absolute top-16 right-4 z-20 w-[260px]">
        <div className="rounded-xl border border-primary-glow/15 bg-[#0a0e1a]/40 backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-px h-3 bg-primary-glow/40" />
            <span className="text-[9px] font-mono text-primary-glow/50 tracking-[0.15em] uppercase">AI Vision Analysis</span>
          </div>

          <div className="space-y-3">
            {/* Question input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder={isCaptured ? 'Ask about this image...' : 'Capture a frame first...'}
                className="flex-1 rounded-lg border border-primary-glow/20 bg-[#020617]/60 px-3 py-2 text-[10px] font-mono text-hud-text/80 placeholder:text-hud-muted/15 outline-none focus:border-primary-glow/40 focus:shadow-[0_0_10px_rgba(0,229,255,0.08)] transition-all"
              />
              <button
                onClick={handleAnalyze}
                disabled={!question.trim() || analyzing || !isCaptured}
                className="px-3 py-2 rounded-lg bg-primary-glow/10 border border-primary-glow/25 text-[9px] font-mono text-primary-glow/80 tracking-wider uppercase
                  hover:bg-primary-glow/20 hover:border-primary-glow/40
                  disabled:opacity-25 disabled:cursor-not-allowed
                  transition-all duration-300"
              >
                {analyzing ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full border border-primary-glow/60 border-t-transparent animate-spin" />
                    Scan
                  </span>
                ) : 'Ask'}
              </button>
            </div>

            {/* Response */}
            {showResponse && (aiResponse || error) && (
              <div className={`p-3 rounded-lg border ${
                error
                  ? 'bg-hud-error/5 border-hud-error/20'
                  : 'bg-primary-glow/[0.04] border-primary-glow/15'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1 h-1 rounded-full ${error ? 'bg-hud-error' : 'bg-primary-glow'} shadow-[0_0_4px_rgba(0,229,255,0.4)]`} />
                    <span className="text-[8px] font-mono text-hud-muted/40 tracking-[0.1em] uppercase">
                      {error ? 'Error' : 'J.A.R.V.I.S'}
                    </span>
                  </div>
                  {aiResponse && !error && (
                    <button
                      onClick={handleSpeak}
                      className="text-[8px] font-mono text-primary-glow/40 hover:text-primary-glow/70 tracking-wider transition-colors"
                    >
                      {speaking ? '■ STOP' : '♪ SPEAK'}
                    </button>
                  )}
                </div>
                <div className="max-h-[180px] overflow-y-auto">
                  <p className={`text-[10px] font-mono leading-relaxed ${
                    error ? 'text-hud-error/70' : 'text-hud-text/70'
                  }`}>
                    {error || aiResponse}
                  </p>
                </div>
              </div>
            )}

            {/* Status hint */}
            {!showResponse && (
              <p className="text-[9px] font-mono text-hud-muted/20 text-center leading-relaxed">
                {isCaptured
                  ? 'Frame locked. Ask J.A.R.V.I.S to analyze.'
                  : isActive
                    ? 'Capture a frame to begin analysis.'
                    : 'Initialize the camera to start.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* === BOTTOM CONTROLS + WAVEFORM === */}
      <div className="absolute bottom-16 left-0 right-0 z-20 flex flex-col items-center gap-3 px-4">
        {/* Waveform */}
        <div className="flex items-center gap-4 px-6 py-2 rounded-xl border border-primary-glow/10 bg-[#0a0e1a]/30 backdrop-blur-sm">
          <span className="text-[8px] font-mono text-primary-glow/30 tracking-[0.15em] uppercase">Freq</span>
          <Waveform active={waveformActive} speaking={speaking} />
          <span className="text-[8px] font-mono text-primary-glow/30 tracking-[0.15em] uppercase">
            {speaking ? 'Vocal' : isActive ? 'Signal' : 'Idle'}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {cameraStatus === 'idle' && (
            <button onClick={handleStartCamera}
              className="group relative px-8 py-2.5 rounded-lg bg-primary-glow/8 border border-primary-glow/25 text-xs font-mono text-primary-glow/90 tracking-[0.2em] uppercase
                hover:bg-primary-glow/15 hover:border-primary-glow/40 hover:shadow-[0_0_25px_rgba(0,229,255,0.12)]
                transition-all duration-300">
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-sm">◉</span>
                Initialize Camera
              </span>
            </button>
          )}

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

      {/* === BOTTOM DOCK === */}
      <BottomDock />
    </div>
  )
}
