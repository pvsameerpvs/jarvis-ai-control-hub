'use client'

type WaveformState = 'idle' | 'listening' | 'processing' | 'speaking' | 'executing'

interface VoiceWaveformProps {
  state?: WaveformState
  barCount?: number
}

export default function VoiceWaveform({
  state = 'idle',
  barCount = 9,
}: VoiceWaveformProps) {
  if (state === 'processing') {
    return (
      <div className="flex items-center justify-center h-16 gap-1">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-primary-glow/30 border-t-primary-glow animate-spin" />
          <div className="absolute inset-2 rounded-full border border-primary-glow/20 border-b-primary-glow animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          <div className="absolute inset-4 rounded-full bg-primary-glow/20 animate-pulse" />
        </div>
      </div>
    )
  }

  if (state === 'executing') {
    return (
      <div className="flex items-center justify-center h-16 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-hud-success"
            style={{
              animation: `glowPulse ${0.5 + i * 0.1}s ease-in-out ${i * 0.15}s infinite`,
              boxShadow: '0 0 8px rgba(34,197,94,0.6)',
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-16 gap-[3px]">
      {Array.from({ length: barCount }).map((_, i) => {
        const isSpeaking = state === 'speaking'
        const isListening = state === 'listening'
        const isIdle = state === 'idle'

        const barDuration = isSpeaking
          ? 0.3 + (i % 3) * 0.05
          : isListening
            ? 0.5 + (i % 4) * 0.1
            : 1.5 + (i % 3) * 0.3

        const barDelay = i * (isSpeaking ? 0.05 : isListening ? 0.08 : 0.12)

        const barMinHeight = isIdle ? '8px' : '4px'
        const barMaxHeight = isIdle ? '24px' : isListening ? '48px' : '56px'

        const opacity = isIdle
          ? 0.3 + (i / barCount) * 0.3
          : 0.6 + (i / barCount) * 0.4

        return (
          <div
            key={i}
            className="w-[3px] rounded-full bg-primary-glow transition-all duration-300"
            style={{
              height: barMaxHeight,
              minHeight: barMinHeight,
              opacity,
              animation: `listeningWave ${barDuration}s ease-in-out ${barDelay}s infinite`,
              animationDirection: isIdle ? 'alternate' : 'normal',
              boxShadow: isSpeaking
                ? `0 0 ${4 + (i % 3) * 2}px rgba(0,229,255,0.6)`
                : isListening
                  ? '0 0 6px rgba(0,229,255,0.4)'
                  : 'none',
              transformOrigin: 'center bottom',
            }}
          />
        )
      })}
    </div>
  )
}
