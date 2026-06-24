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
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [lastResponse, setLastResponse] = useState('')
  const [displayedResponse, setDisplayedResponse] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [highlightedPanel, setHighlightedPanel] = useState<string | null>(null)

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
        body: JSON.stringify({ command: text, transcript: text, timestamp: new Date().toISOString() }),
      })
      const data = await res.json()
      const responseText = data.response || data.message || JSON.stringify(data)
      setLastResponse(responseText)
      startTypingEffect(responseText)
      setVoiceState('idle')
    } catch {
      const errMsg = 'Command failed. Please try again.'
      setLastResponse(errMsg)
      setDisplayedResponse(errMsg)
      setVoiceState('error')
    }
  }, [addToHistory, stopTyping, startTypingEffect])

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
  const { voiceState, setVoiceState, lastResponse, setLastResponse, addToHistory, startTypingEffect, stopTyping, setDisplayedResponse } = useJarvis()

  const [transcript, setTranscript] = useState('')
  const [micSupported, setMicSupported] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthesisRef.current = window.speechSynthesis
      if (!navigator.mediaDevices?.getUserMedia) {
        setMicSupported(false)
      }
    }
  }, [])

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
    utterance.lang = 'en-US'
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
        body: JSON.stringify({ command, transcript: command, timestamp: new Date().toISOString() }),
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      const data = await response.json()
      const responseText = data.response || data.message || JSON.stringify(data)
      setLastResponse(responseText)
      setVoiceState('idle')
      setDisplayedResponse(responseText)

      if (voiceEnabledRef.current && responseText) {
        if (data.action === 'tool_execution') {
          setTimeout(() => speakResponse(responseText), 1000)
        } else {
          speakResponse(responseText)
        }
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
  }, [addToHistory, speakResponse, stopTyping])

  const transcribeAndSend = useCallback(async () => {
    if (recordedChunksRef.current.length === 0) return
    setVoiceState('processing')
    const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' })
    recordedChunksRef.current = []

    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')

    try {
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Transcription failed')

      if (!voiceEnabledRef.current) return

      const { text } = await res.json()
      if (text?.trim()) {
        setTranscript(text.trim())
        sendCommand(text.trim())
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
          return
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

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <MicIcon className={`w-3.5 h-3.5 ${isVoiceActive ? 'text-blue-400' : 'text-blue-700/40'}`} />
          <span className={`text-[10px] font-mono tracking-wider ${isVoiceActive ? 'text-blue-400/80' : 'text-blue-700/40'}`}>
            {voiceState === 'listening' ? (isSpeaking ? 'HEARING...' : 'WAITING...') :
             voiceState === 'processing' ? 'THINKING...' :
             voiceState === 'speaking' ? 'SPEAKING...' :
             voiceState === 'executing' ? 'EXECUTING...' :
             voiceState === 'error' ? 'ERROR' :
             'OFF'}
          </span>
        </div>
        <button
          onClick={handleToggleVoice}
          className={`
            relative w-9 h-5 rounded-full transition-all duration-300
            ${voiceEnabled ? 'bg-blue-400/40' : 'bg-blue-900/30'}
            ${!micSupported ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
          `.trim()}
        >
          <span className={`
            absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md
            ${voiceEnabled ? 'translate-x-4' : 'translate-x-0'}
          `.trim()} />
        </button>
      </div>

      {!micSupported && (
        <p className="text-[9px] font-mono text-blue-700/60 tracking-wide">
          Mic unavailable
        </p>
      )}

      {transcript && (
        <div className="w-full p-2 rounded bg-blue-950/30 border border-blue-500/15">
          <p className="text-[10px] font-mono text-blue-300/70 break-words">{transcript}</p>
        </div>
      )}
    </div>
  )
}

export { JarvisContext }
