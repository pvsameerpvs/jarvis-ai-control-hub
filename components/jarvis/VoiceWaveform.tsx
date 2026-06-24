'use client'

import { useJarvis } from './VoiceAssistant'

type WaveformState = 'idle' | 'listening' | 'processing' | 'speaking' | 'executing' | 'error'

interface VoiceWaveformProps {
  state?: WaveformState
}

export default function VoiceWaveform({ state = 'idle' }: VoiceWaveformProps) {
  const { audioLevel } = useJarvis()
  const isActive = state !== 'idle' && state !== 'error'
  const influence = isActive ? audioLevel : audioLevel * 0.15
  const barCount = 21

  if (state === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center h-16 gap-1.5">
        <div className="flex items-center gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i}
              className="w-[2px] rounded-full transition-all duration-100"
              style={{
                height: 12 + Math.sin(Date.now() * 0.003 + i) * 8 + 8,
                background: 'linear-gradient(to top, rgba(0,229,255,0.2), rgba(0,229,255,0.8))',
                boxShadow: '0 0 4px rgba(0,229,255,0.4)',
                animation: `listeningWave ${0.3 + i * 0.05}s ease-in-out ${i * 0.08}s infinite`,
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-[#00E5FF] animate-pulse shadow-[0_0_6px_rgba(0,229,255,0.6)]" />
          <span className="font-mono text-[9px] tracking-[0.25em] text-[#00E5FF]/60 uppercase animate-pulse">
            Processing
          </span>
        </div>
      </div>
    )
  }

  if (state === 'executing') {
    return (
      <div className="flex flex-col items-center justify-center h-16 gap-1.5">
        <div className="flex items-center gap-[2px]">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i}
              className="w-[2px] rounded-full"
              style={{
                height: 8 + Math.sin(Date.now() * 0.002 + i * 0.5) * 6 + 6,
                background: 'linear-gradient(to top, rgba(34,197,94,0.2), rgba(34,197,94,0.8))',
                boxShadow: '0 0 4px rgba(34,197,94,0.4)',
                animation: `glowPulse ${0.5 + i * 0.1}s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-[#22C55E] animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
          <span className="font-mono text-[9px] tracking-[0.25em] text-[#22C55E]/60 uppercase">Executing</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-16 gap-1">
      {/* Waveform center divider */}
      <div className="relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
          style={{
            background: `linear-gradient(to bottom, transparent, rgba(0,229,255,${0.05 + influence * 0.1}), transparent)`,
          }}
        />
      </div>
      {/* Upper bars */}
      <div className="flex items-end justify-center h-7 gap-[2px]">
        {Array.from({ length: barCount }).map((_, i) => {
          const mid = Math.floor(barCount / 2)
          const dist = Math.abs(i - mid) / mid
          const isSpeaking = state === 'speaking'
          const isListening = state === 'listening'
          const dur = isSpeaking
            ? 0.15 + dist * 0.15
            : isListening
              ? 0.25 + dist * 0.2
              : 1 + dist * 0.5
          const delay = i * (isSpeaking ? 0.025 : isListening ? 0.04 : 0.06)
          const height = isSpeaking
            ? 4 + (1 - dist) * 24 + influence * 20
            : isListening
              ? 3 + (1 - dist) * 16 + influence * 16
              : 2 + (1 - dist) * 8 + influence * 6
          const opacity = isSpeaking
            ? 0.4 + (1 - dist) * 0.5 + influence * 0.3
            : isListening
              ? 0.3 + (1 - dist) * 0.4 + influence * 0.3
              : 0.1 + (1 - dist) * 0.2 + influence * 0.15
          return (
            <div key={`u-${i}`}
              className="w-[2.5px] rounded-t-sm transition-all duration-75"
              style={{
                height,
                opacity: Math.min(1, opacity),
                background: `linear-gradient(to top, rgba(0,229,255,0.1), rgba(0,229,255,${(0.5 + influence * 0.5).toFixed(2)}))`,
                boxShadow: influence > 0.02
                  ? `0 0 ${(2 + influence * 10).toFixed(0)}px rgba(0,229,255,${(0.2 + influence * 0.4).toFixed(2)})`
                  : 'none',
                animation: state !== 'idle' ? `listeningWave ${dur.toFixed(2)}s ease-in-out ${delay.toFixed(2)}s infinite` : 'none',
              }}
            />
          )
        })}
      </div>
      {/* Lower bars (mirrored VU meter) */}
      <div className="flex items-start justify-center h-7 gap-[2px]">
        {Array.from({ length: barCount }).map((_, i) => {
          const mid = Math.floor(barCount / 2)
          const dist = Math.abs(i - mid) / mid
          const isSpeaking = state === 'speaking'
          const isListening = state === 'listening'
          const dur = isSpeaking
            ? 0.15 + dist * 0.15
            : isListening
              ? 0.25 + dist * 0.2
              : 1 + dist * 0.5
          const delay = i * (isSpeaking ? 0.025 : isListening ? 0.04 : 0.06)
          const height = isSpeaking
            ? 4 + (1 - dist) * 24 + influence * 20
            : isListening
              ? 3 + (1 - dist) * 16 + influence * 16
              : 2 + (1 - dist) * 8 + influence * 6
          const opacity = isSpeaking
            ? 0.4 + (1 - dist) * 0.5 + influence * 0.3
            : isListening
              ? 0.3 + (1 - dist) * 0.4 + influence * 0.3
              : 0.1 + (1 - dist) * 0.2 + influence * 0.15
          return (
            <div key={`l-${i}`}
              className="w-[2.5px] rounded-b-sm transition-all duration-75"
              style={{
                height,
                opacity: Math.min(1, opacity),
                background: `linear-gradient(to bottom, rgba(0,229,255,0.1), rgba(0,229,255,${(0.5 + influence * 0.5).toFixed(2)}))`,
                boxShadow: influence > 0.02
                  ? `0 0 ${(2 + influence * 10).toFixed(0)}px rgba(0,229,255,${(0.2 + influence * 0.4).toFixed(2)})`
                  : 'none',
                animation: state !== 'idle' ? `listeningWave ${dur.toFixed(2)}s ease-in-out ${delay.toFixed(2)}s infinite` : 'none',
              }}
            />
          )
        })}
      </div>
      {/* Audio level indicator */}
      <div className="flex items-center gap-2.5 mt-0.5">
        <div className="flex items-center gap-1.5">
          <div className="w-12 h-[2px] rounded-full overflow-hidden bg-[#00E5FF]/10">
            <div className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${Math.min(100, influence * 200)}%`,
                background: 'linear-gradient(to right, rgba(0,229,255,0.3), rgba(0,229,255,0.8))',
                boxShadow: `0 0 ${4 + influence * 8}px rgba(0,229,255,${0.2 + influence * 0.4})`,
              }}
            />
          </div>
          <span className="font-mono text-[7px] tracking-[0.15em] text-[#00E5FF]/30">
            {state === 'speaking' ? 'TX' : state === 'listening' ? 'RX' : '--'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`w-[2px] h-2 rounded-full ${influence > 0.01 ? 'bg-[#00E5FF]/60' : 'bg-[#00E5FF]/10'}`}
            style={{ transition: 'all 100ms' }} />
          <span className={`w-[2px] h-2.5 rounded-full ${influence > 0.03 ? 'bg-[#00E5FF]/70' : 'bg-[#00E5FF]/10'}`}
            style={{ transition: 'all 100ms' }} />
          <span className={`w-[2px] h-3 rounded-full ${influence > 0.06 ? 'bg-[#00E5FF]/80' : 'bg-[#00E5FF]/10'}`}
            style={{ transition: 'all 100ms' }} />
          <span className={`w-[2px] h-3.5 rounded-full ${influence > 0.1 ? 'bg-[#00E5FF]/90' : 'bg-[#00E5FF]/10'}`}
            style={{ transition: 'all 100ms' }} />
          <span className={`w-[2px] h-4 rounded-full ${influence > 0.15 ? 'bg-[#00E5FF]' : 'bg-[#00E5FF]/10'}`}
            style={{ transition: 'all 100ms' }} />
        </div>
      </div>
    </div>
  )
}
