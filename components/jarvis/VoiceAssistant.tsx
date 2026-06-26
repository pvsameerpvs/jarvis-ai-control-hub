'use client'

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'executing' | 'error'

const TYPING_SPEED_MS = 25

interface JarvisContextValue {
  voiceState: VoiceState
  setVoiceState: (state: VoiceState) => void
  lastResponse: string
  setLastResponse: (response: string) => void
  displayedResponse: string
  setDisplayedResponse: (response: string) => void
  isTyping: boolean
  commandHistory: string[]
  addToHistory: (command: string) => void
  highlightedPanel: string | null
  setHighlightedPanel: (panel: string | null) => void
  sendTextMessage: (text: string) => Promise<void>
  startTypingEffect: (text: string, onComplete?: () => void) => void
  stopTyping: () => void
  audioLevel: number
  setAudioLevel: (level: number) => void
  voiceEnabled: boolean
  setVoiceEnabled: (enabled: boolean) => void
  language: string
}

const JarvisContext = createContext<JarvisContextValue | undefined>(undefined)

export function useJarvis(): JarvisContextValue {
  const ctx = useContext(JarvisContext)
  if (!ctx) {
    throw new Error('useJarvis must be used within a JarvisProvider')
  }
  return ctx
}

export function JarvisProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [lastResponse, setLastResponse] = useState('')
  const [displayedResponse, setDisplayedResponse] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [highlightedPanel, setHighlightedPanel] = useState<string | null>(null)
  const [rawLevel, setRawLevel] = useState(0)
  const [smoothLevel, setSmoothLevel] = useState(0)
  const rafSmoothRef = useRef<number | null>(null)
  const smoothLevelRef = useRef(0)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [language, setLanguage] = useState('en-US')

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => { if (d.settings?.language) setLanguage(d.settings.language) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const smooth = () => {
      smoothLevelRef.current += (rawLevel - smoothLevelRef.current) * 0.12
      if (Math.abs(smoothLevelRef.current - rawLevel) < 0.001) {
        smoothLevelRef.current = rawLevel
      }
      setSmoothLevel(smoothLevelRef.current)
      rafSmoothRef.current = requestAnimationFrame(smooth)
    }
    rafSmoothRef.current = requestAnimationFrame(smooth)
    return () => {
      if (rafSmoothRef.current) cancelAnimationFrame(rafSmoothRef.current)
    }
  }, [rawLevel])

  const stopTyping = useCallback(() => {
    if (typingRef.current) {
      clearInterval(typingRef.current)
      typingRef.current = null
    }
    setIsTyping(false)
  }, [])

  const startTypingEffect = useCallback((fullText: string, onComplete?: () => void) => {
    stopTyping()
    setDisplayedResponse('')
    if (!fullText) {
      onComplete?.()
      return
    }

    setIsTyping(true)
    let index = 0
    typingRef.current = setInterval(() => {
      index++
      if (index >= fullText.length) {
        setDisplayedResponse(fullText)
        stopTyping()
        onComplete?.()
      } else {
        setDisplayedResponse(fullText.slice(0, index + 1))
      }
    }, TYPING_SPEED_MS)
  }, [stopTyping])

  const addToHistory = useCallback((command: string) => {
    setCommandHistory((prev) => [command, ...prev].slice(0, 50))
  }, [])

  const sendTextMessage = useCallback(async (text: string) => {
    addToHistory(text)
    setLastResponse('')
    setDisplayedResponse('')
    stopTyping()
    setVoiceState('processing')
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: text, transcript: text, language: language || 'en-US', timestamp: new Date().toISOString() }),
      })
      const data = await res.json()
      const responseText = data.response || data.message || JSON.stringify(data)
      setLastResponse(responseText)
      startTypingEffect(responseText)
      setVoiceState('idle')

      if (data.tool === 'openCamera') {
        const q = encodeURIComponent(text)
        router.push(`/camera?auto=true&q=${q}`)
        return
      } else if (/open camera|check camera|what.*in front|look.*camera|see.*camera/i.test(text) && data.tool === undefined) {
        const q = encodeURIComponent(text)
        router.push(`/camera?auto=true&q=${q}`)
        return
      }
    } catch {
      const errMsg = 'Command failed. Please try again.'
      setLastResponse(errMsg)
      setDisplayedResponse(errMsg)
      setVoiceState('error')
    }
  }, [addToHistory, stopTyping, startTypingEffect, language, router])

  return (
    <JarvisContext.Provider
      value={{
        voiceState,
        setVoiceState,
        lastResponse,
        setLastResponse,
        displayedResponse,
        setDisplayedResponse,
        isTyping,
        commandHistory,
        addToHistory,
        highlightedPanel,
        setHighlightedPanel,
        sendTextMessage,
        startTypingEffect,
        stopTyping,
        audioLevel: smoothLevel,
        setAudioLevel: setRawLevel,
        voiceEnabled,
        setVoiceEnabled,
        language,
      }}
    >
      {children}
    </JarvisContext.Provider>
  )
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  )
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

const SILENCE_MS = 1200
const SPEECH_THRESHOLD = 0.02

export default function VoiceAssistant() {
  const { voiceState, setVoiceState, voiceEnabled, setVoiceEnabled, lastResponse, setLastResponse, addToHistory, startTypingEffect, stopTyping, setDisplayedResponse, audioLevel, setAudioLevel } = useJarvis()
  const router = useRouter()

  const [transcript, setTranscript] = useState('')
  const [micSupported, setMicSupported] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [language, setLanguage] = useState('en-US')

  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const silenceStartRef = useRef<number | null>(null)
  const speakingRef = useRef(false)
  const recordedChunksRef = useRef<Blob[]>([])
  const autoStartedRef = useRef(false)
  const voiceEnabledRef = useRef(false)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const isProcessingRef = useRef(false)
  const startListeningRef = useRef<() => void>(() => {})
  const languageRef = useRef('en-US')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthesisRef.current = window.speechSynthesis
      if (!navigator.mediaDevices?.getUserMedia) {
        setMicSupported(false)
      }
      fetch('/api/settings')
        .then(r => r.json())
        .then(d => {
          const lang = d.settings?.language || 'en-US'
          setLanguage(lang)
          languageRef.current = lang
        })
        .catch(() => {})
    }
  }, [])

  useEffect(() => { languageRef.current = language }, [language])

  const stopMic = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    mediaRecorderRef.current = null
    analyserRef.current = null
    recordedChunksRef.current = []
    silenceStartRef.current = null
  }, [])

  const speakResponse = useCallback((text: string) => {
    if (!synthesisRef.current) return
    if (!voiceEnabledRef.current) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = languageRef.current || 'en-US'
    utterance.rate = 1.0
    utterance.pitch = 0.9
    utterance.onstart = () => setVoiceState('speaking')
    utterance.onend = () => {
      recordedChunksRef.current = []
      if (voiceEnabledRef.current) startListening()
    }
    utterance.onerror = () => {
      recordedChunksRef.current = []
      if (voiceEnabledRef.current) startListening()
    }
    utteranceRef.current = utterance
    synthesisRef.current.speak(utterance)
  }, [])

  const sendCommand = useCallback(async (command: string) => {
    isProcessingRef.current = true
    addToHistory(command)
    setVoiceState('processing')
    stopTyping()

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          transcript: command,
          language: languageRef.current || 'en-US',
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      const data = await response.json()
      const responseText = data.response || data.message || JSON.stringify(data)
      setLastResponse(responseText)
      setVoiceState('idle')
      setDisplayedResponse(responseText)

      const isCameraCmd = /open camera|check camera|what.*in front|look.*camera|see.*camera/i.test(command)
      if (data.tool === 'openCamera' || (isCameraCmd && data.tool === undefined)) {
        const q = encodeURIComponent(command)
        router.push(`/camera?auto=true&q=${q}`)
      }

      if (voiceEnabledRef.current && responseText) {
        speakResponse(responseText)
      } else if (voiceEnabledRef.current) {
        startListeningRef.current?.()
      }
    } catch {
      setVoiceState('error')
      const errMsg = 'Command failed. Please try again.'
      setLastResponse(errMsg)
      setDisplayedResponse(errMsg)
      setTimeout(() => {
        if (voiceEnabledRef.current) startListeningRef.current?.()
      }, 2000)
    }
    isProcessingRef.current = false
  }, [addToHistory, speakResponse, stopTyping, router])

  const transcribeAndSend = useCallback(async () => {
    if (recordedChunksRef.current.length === 0) return
    setVoiceState('processing')
    const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' })
    recordedChunksRef.current = []

    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')
    formData.append('language', languageRef.current || 'en-US')

    try {
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Transcription failed')

      if (!voiceEnabledRef.current) return

      const { text } = await res.json()
      if (text?.trim()) {
        setTranscript(text.trim())
        const t = text.trim()
        if (/open camera|check camera|what.*in front|what.*infront|look.*camera|see.*camera|in front of/i.test(t)) {
          setVoiceState('idle')
          const q = encodeURIComponent(t)
          router.push(`/camera?auto=true&q=${q}`)
          return
        }
        sendCommand(t)
      } else {
        if (voiceEnabledRef.current) startListening()
      }
    } catch {
      setTranscript('')
      if (voiceEnabledRef.current) startListening()
    }
  }, [sendCommand])

  const checkAudioLevel = useCallback(() => {
    if (!analyserRef.current || !voiceEnabledRef.current) return
    const data = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteTimeDomainData(data)

    let max = 0
    for (let i = 0; i < data.length; i++) {
      const v = Math.abs(data[i] - 128) / 128
      if (v > max) max = v
    }

    setAudioLevel(max)

    if (max > SPEECH_THRESHOLD) {
      if (!speakingRef.current) {
        speakingRef.current = true
        setIsSpeaking(true)
        recordedChunksRef.current = []
      }
      silenceStartRef.current = null
    } else {
      if (speakingRef.current) {
        if (silenceStartRef.current === null) {
          silenceStartRef.current = Date.now()
        } else if (Date.now() - silenceStartRef.current > SILENCE_MS) {
          speakingRef.current = false
          setIsSpeaking(false)
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop()
          }
        }
      }
    }

    requestAnimationFrame(checkAudioLevel)
  }, [])

  const startListening = useCallback(async () => {
    startListeningRef.current = startListening
    if (!voiceEnabledRef.current) return
    voiceEnabledRef.current = true
    stopMic()
    setTranscript('')
    recordedChunksRef.current = []
    speakingRef.current = false
    setIsSpeaking(false)
    silenceStartRef.current = null

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const audioCtx = new AudioContext()
      if (audioCtx.state === 'suspended') await audioCtx.resume()
      audioContextRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        transcribeAndSend()
      }

      recorder.start()
      setVoiceState('listening')
      setIsSpeaking(false)
      checkAudioLevel()
    } catch {
      setMicSupported(false)
      setVoiceEnabled(false)
      voiceEnabledRef.current = false
      setVoiceState('idle')
    }
  }, [checkAudioLevel, transcribeAndSend, stopMic])

  useEffect(() => {
    if (autoStartedRef.current) return
    autoStartedRef.current = true
    const timer = setTimeout(() => {
      if (micSupported && voiceEnabledRef.current) startListening()
    }, 800)
    return () => clearTimeout(timer)
  }, [micSupported, startListening])

  const handleToggleVoice = useCallback(() => {
    if (voiceEnabled) {
      synthesisRef.current?.cancel()
      stopMic()
      stopTyping()
      setVoiceState('idle')
      setTranscript('')
      setLastResponse('')
      setDisplayedResponse('')
      setVoiceEnabled(false)
      voiceEnabledRef.current = false
    } else {
      setVoiceEnabled(true)
      voiceEnabledRef.current = true
      setTimeout(() => startListening(), 300)
    }
  }, [voiceEnabled, startListening, stopMic, stopTyping, setLastResponse, setDisplayedResponse])

  const isVoiceActive = voiceState !== 'idle'
  const isError = voiceState === 'error'

  const statusText = voiceState === 'listening' ? (isSpeaking ? 'SIGNAL DETECTED' : 'STANDBY') :
    voiceState === 'processing' ? 'PROCESSING' :
    voiceState === 'speaking' ? 'OUTPUT' :
    voiceState === 'executing' ? 'EXECUTING' :
    voiceState === 'error' ? 'LINK ERROR' :
    'OFFLINE'

  const statusIcon = voiceState === 'listening' ? '◈' :
    voiceState === 'processing' ? '◇' :
    voiceState === 'speaking' ? '◈' :
    voiceState === 'executing' ? '◆' :
    voiceState === 'error' ? '◆' : '◇'

  return (
    <div className="w-full">
      {/* Holographic panel */}
      <div className="relative rounded-sm border border-[#00E5FF]/15 bg-[#020617]/80 backdrop-blur-sm">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-2 h-px bg-gradient-to-r from-[#00E5FF]/60 to-transparent" />
        <div className="absolute top-0 left-0 w-px h-2 bg-gradient-to-b from-[#00E5FF]/60 to-transparent" />
        <div className="absolute top-0 right-0 w-2 h-px bg-gradient-to-l from-[#00E5FF]/60 to-transparent" />
        <div className="absolute top-0 right-0 w-px h-2 bg-gradient-to-b from-[#00E5FF]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-2 h-px bg-gradient-to-r from-[#00E5FF]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-px h-2 bg-gradient-to-t from-[#00E5FF]/60 to-transparent" />
        <div className="absolute bottom-0 right-0 w-2 h-px bg-gradient-to-l from-[#00E5FF]/60 to-transparent" />
        <div className="absolute bottom-0 right-0 w-px h-2 bg-gradient-to-t from-[#00E5FF]/60 to-transparent" />

        {/* Top divider line */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#00E5FF]/15 to-transparent mx-3" />

        {/* Header row */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <span className={`font-mono text-[9px] ${isError ? 'text-[#FB7185]/70' : 'text-[#00E5FF]/70'}`}
              style={{
                textShadow: isVoiceActive ? `0 0 ${4 + audioLevel * 6}px rgba(0,229,255,0.3)` : 'none',
              }}>
              {statusIcon}
            </span>
            <span className="font-mono text-[9px] tracking-[0.2em] text-[#00E5FF]/40">AUDIO::LINK</span>
            <span className={`font-mono text-[8px] tracking-[0.15em] ${voiceEnabled ? 'text-[#00E5FF]/70' : 'text-[#00E5FF]/20'}`}>
              [{voiceEnabled ? 'ACTIVE' : 'DISABLED'}]
            </span>
          </div>
          <button
            onClick={handleToggleVoice}
            disabled={!micSupported}
            className="relative group"
          >
            <div className={`
              relative w-8 h-3.5 rounded-sm transition-all duration-300
              ${voiceEnabled ? 'bg-[#00E5FF]/20' : 'bg-[#00E5FF]/5'}
              ${!micSupported ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
              border border-[#00E5FF]/20
            `}>
              <span className={`
                absolute top-[1px] w-3 h-[10px] rounded-[1px] transition-all duration-300
                ${voiceEnabled
                  ? 'left-[18px] bg-[#00E5FF] shadow-[0_0_6px_rgba(0,229,255,0.6)]'
                  : 'left-[1px] bg-[#00E5FF]/30'
                }
              `} />
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#00E5FF]/10 to-transparent mx-3" />

        {/* Status row */}
        <div className="px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-[1px] transition-all duration-300 ${
              isError ? 'bg-[#FB7185] shadow-[0_0_6px_rgba(251,113,133,0.6)]' :
              isVoiceActive ? 'bg-[#00E5FF] shadow-[0_0_6px_rgba(0,229,255,0.6)]' :
              'bg-[#00E5FF]/20'
            } ${isVoiceActive ? 'animate-pulse' : ''}`} />
            <span className={`font-mono text-[9px] tracking-[0.25em] ${
              isError ? 'text-[#FB7185]/70' : isVoiceActive ? 'text-[#00E5FF]/80' : 'text-[#00E5FF]/30'
            }`}>
              {statusText}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[7px] text-[#00E5FF]/20 tracking-[0.15em]">SIG</span>
            <div className="w-8 h-[2px] rounded-full overflow-hidden bg-[#00E5FF]/8">
              <div className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${Math.min(100, audioLevel * 300)}%`,
                  background: 'linear-gradient(to right, rgba(0,229,255,0.3), rgba(0,229,255,0.8))',
                }}
              />
            </div>
          </div>
        </div>

        {/* Transcript */}
        {transcript && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-[#00E5FF]/8 to-transparent mx-3" />
            <div className="px-3 py-1.5">
              <div className="flex items-start gap-1.5">
                <span className="font-mono text-[9px] text-[#00E5FF]/40 mt-0.5">{'>'}</span>
                <p className="font-mono text-[9px] text-[#00E5FF]/70 break-words leading-relaxed tracking-wide">
                  {transcript}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Bottom status bar */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#00E5FF]/10 to-transparent mx-3" />
        <div className="px-3 py-1 flex items-center justify-between">
          <span className="font-mono text-[7px] text-[#00E5FF]/20 tracking-[0.15em]">
            {voiceEnabled ? 'LINK::ESTABLISHED' : 'LINK::STANDBY'}
          </span>
          <span className="font-mono text-[7px] text-[#00E5FF]/20 tracking-[0.15em]">
            v2.1.4
          </span>
        </div>
      </div>

      {!micSupported && (
        <div className="mt-1.5 flex items-center gap-1.5 justify-center">
          <span className="w-1 h-1 rounded-full bg-[#FB7185]/60" />
          <span className="font-mono text-[8px] text-[#FB7185]/50 tracking-[0.15em]">
            MIC UNAVAILABLE
          </span>
        </div>
      )}
    </div>
  )
}

export { JarvisContext }
