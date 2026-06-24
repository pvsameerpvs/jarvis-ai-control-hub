'use client'

import { useEffect, useState } from 'react'

type OrbState = 'idle' | 'listening' | 'processing' | 'speaking' | 'executing' | 'error'

interface JarvisOrbProps {
  state?: OrbState
}

const ringSpeeds: Record<OrbState, string> = {
  idle: 'animate-[rotateRing_8s_linear_infinite]',
  listening: 'animate-[rotateRing_6s_linear_infinite]',
  processing: 'animate-[rotateRing_2s_linear_infinite]',
  speaking: 'animate-[rotateRing_4s_linear_infinite]',
  executing: 'animate-[rotateRing_3s_linear_infinite]',
  error: 'animate-[rotateRing_5s_linear_infinite]',
}

const pulseSpeeds: Record<OrbState, string> = {
  idle: 'animate-[orbPulse_4s_ease-in-out_infinite]',
  listening: 'animate-[orbPulse_0.8s_ease-in-out_infinite]',
  processing: 'animate-[orbPulse_0.3s_ease-in-out_infinite]',
  speaking: 'animate-[orbPulse_0.6s_ease-in-out_infinite]',
  executing: 'animate-[orbPulse_0.5s_ease-in-out_infinite]',
  error: 'animate-[orbPulse_0.4s_ease-in-out_infinite]',
}

const orbitCount = 12
const particleCount = 20

export default function JarvisOrb({ state = 'idle' }: JarvisOrbProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="relative flex items-center justify-center w-[280px] h-[280px]" />
    )
  }

  return (
    <div className="relative flex items-center justify-center w-[280px] h-[280px]">
      {/* Outer glow */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-700 ${
          state === 'error'
            ? 'shadow-[0_0_80px_rgba(251,113,133,0.4),0_0_160px_rgba(251,113,133,0.2)]'
            : state === 'listening'
              ? 'shadow-[0_0_80px_rgba(0,229,255,0.5),0_0_160px_rgba(0,229,255,0.25)]'
              : state === 'speaking'
                ? 'shadow-[0_0_80px_rgba(0,229,255,0.6),0_0_160px_rgba(0,229,255,0.3)]'
                : state === 'processing'
                  ? 'shadow-[0_0_100px_rgba(37,99,235,0.5),0_0_200px_rgba(0,229,255,0.2)]'
                  : state === 'executing'
                    ? 'shadow-[0_0_90px_rgba(34,197,94,0.4),0_0_180px_rgba(0,229,255,0.2)]'
                    : 'shadow-[0_0_60px_rgba(0,229,255,0.2),0_0_120px_rgba(0,229,255,0.1)]'
        }`}
      />

      {/* Outer rotating dashed ring */}
      <div
        className={`absolute inset-2 rounded-full border-2 border-dashed border-primary-glow/30 ${ringSpeeds[state]}`}
        style={
          state === 'speaking'
            ? { animationDuration: '4s' }
            : state === 'listening'
              ? { animationDuration: '6s' }
              : undefined
        }
      />

      {/* Second ring (solid, opposite direction) */}
      <div
        className={`absolute inset-6 rounded-full border border-primary-glow/20 ${ringSpeeds[state]} -rotate-180`}
        style={{ animationDirection: 'reverse' }}
      />

      {/* Third ring (inner, thinner) */}
      <div
        className={`absolute inset-10 rounded-full border border-primary-glow/10 ${ringSpeeds[state]}`}
      />

      {/* Orbit trail dots */}
      {Array.from({ length: orbitCount }).map((_, i) => {
        const angle = (i * 360) / orbitCount
        const radius = 118
        const rad = (angle * Math.PI) / 180
        const x = Math.cos(rad) * radius
        const y = Math.sin(rad) * radius
        return (
          <div
            key={`orbit-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary-glow"
            style={{
              transform: `translate(${x}px, ${y}px)`,
              opacity: state === 'error' ? 0.6 : 0.4 + (i / orbitCount) * 0.6,
              animation: `rotateRing ${3 + (i % 3)}s linear infinite`,
              animationDelay: `${i * 0.15}s`,
              transformOrigin: `-${x}px -${y}px`,
              boxShadow:
                state === 'error'
                  ? '0 0 6px #FB7185'
                  : '0 0 6px rgba(0,229,255,0.8)',
            }}
          />
        )
      })}

      {/* Center orb container */}
      <div
        className={`absolute inset-12 rounded-full ${pulseSpeeds[state]}`}
        style={
          state === 'error'
            ? { boxShadow: 'inset 0 0 60px rgba(251,113,133,0.3)' }
            : state === 'speaking'
              ? { animationDuration: '0.6s' }
              : undefined
        }
      >
        {/* Radial gradient core */}
        <div className="w-full h-full rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.6)_0%,rgba(37,99,235,0.4)_40%,transparent_70%)]" />

        {/* Inner pulse */}
        <div
          className={`absolute inset-4 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.3)_0%,transparent_70%)] animate-ping opacity-30`}
          style={{ animationDuration: '3s' }}
        />

        {/* Center bright core */}
        <div className="absolute inset-[30%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.9)_0%,transparent_100%)] shadow-[0_0_40px_rgba(0,229,255,0.6)]" />
      </div>

      {/* Scanning line (processing state) */}
      {state === 'processing' && (
        <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
          <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-glow to-transparent animate-[scanLine_1.5s_linear_infinite] opacity-70" />
        </div>
      )}

      {/* Error flash overlay */}
      {state === 'error' && (
        <div className="absolute inset-0 rounded-full bg-hud-error/20 animate-pulse pointer-events-none" />
      )}

      {/* Speaking waveform ring */}
      {state === 'speaking' && (
        <div className="absolute inset-0 rounded-full border-2 border-primary-glow/40 animate-[speakingWave_0.5s_ease-in-out_infinite]" />
      )}

      {/* Executing indicator */}
      {state === 'executing' && (
        <div className="absolute -inset-3 rounded-full border border-hud-success/30 animate-pulse shadow-[0_0_30px_rgba(34,197,94,0.15)]" />
      )}

      {/* Floating particles */}
      {Array.from({ length: particleCount }).map((_, i) => {
        const size = 2 + (i % 3)
        const startX = -120 + Math.random() * 240
        const startY = -120 + Math.random() * 240
        const duration = 3 + (i % 5)
        const delay = i * 0.3
        return (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full bg-primary-glow pointer-events-none"
            style={{
              width: size,
              height: size,
              opacity: 0.3 + (i % 3) * 0.2,
              transform: `translate(${startX}px, ${startY}px)`,
              animation: `float ${duration}s ease-in-out ${delay}s infinite`,
              boxShadow: `0 0 ${size * 2}px rgba(0,229,255,0.6)`,
            }}
          />
        )
      })}

      {/* State label */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
        <span className="font-mono text-xs tracking-[0.2em] uppercase text-hud-muted/60">
          {state}
        </span>
      </div>
    </div>
  )
}
