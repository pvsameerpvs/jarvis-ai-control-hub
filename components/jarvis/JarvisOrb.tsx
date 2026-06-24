'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useJarvis } from './VoiceAssistant'

type OrbState = 'idle' | 'listening' | 'processing' | 'speaking' | 'executing' | 'error'

interface JarvisOrbProps {
  state?: OrbState
}

function arc(color: string, o: number | string): string {
  return color.replace('{o}', String(o))
}

const ORBITAL_DOTS = 8
const SEGMENT_COUNT = 8

const orbitConfigs = [
  { rx: 155, ry: 55, tilt: 0, dur: 12 },
  { rx: 155, ry: 45, tilt: 60, dur: 15 },
  { rx: 155, ry: 50, tilt: 120, dur: 10 },
  { rx: 100, ry: 30, tilt: 30, dur: 8 },
]

export default function JarvisOrb({ state = 'idle' }: JarvisOrbProps) {
  const { audioLevel } = useJarvis()
  const [mounted, setMounted] = useState(false)
  const prevLevelRef = useRef(0)
  const [ripples, setRipples] = useState<number[]>([])
  const rippleIdRef = useRef(0)

  const randoms = useMemo(() => Array.from({ length: 60 }, () => Math.random()), [])

  useEffect(() => { setMounted(true) }, [])

  const isActive = state !== 'idle' && state !== 'error'
  const influence = isActive ? audioLevel : audioLevel * 0.2
  const isError = state === 'error'

  const pulseSpeed = Math.max(0.25, isActive ? 0.5 - influence * 0.2 : 3 - influence * 1.5)
  const ringSpeedMult = Math.max(0.3, 1 + influence * 2.5)

  useEffect(() => {
    const threshold = isActive ? 0.04 : 0.12
    if (audioLevel > threshold && audioLevel > prevLevelRef.current * 1.3) {
      const id = rippleIdRef.current++
      setRipples(prev => [...prev.slice(-3), id])
      setTimeout(() => setRipples(prev => prev.filter(r => r !== id)), 1200)
    }
    prevLevelRef.current = audioLevel
  }, [audioLevel, isActive])

  if (!mounted) return <div className="relative flex items-center justify-center w-[360px] h-[360px]" />

  const primaryColor = isError ? '#FB7185' : '#00E5FF'
  const glowColor = isError ? 'rgba(251,113,133,{o})' : 'rgba(0,229,255,{o})'

  const outerCirc = 2 * Math.PI * 165
  const segLen = outerCirc / SEGMENT_COUNT

  return (
    <div className="relative flex items-center justify-center w-[360px] h-[360px]">
      {/* Outer ambient glow */}
      <div className="absolute inset-0 rounded-full blur-[100px] transition-all duration-1000 pointer-events-none"
        style={{
          background: isError
            ? `radial-gradient(circle, rgba(251,113,133,${(0.12 + influence * 0.25).toFixed(3)}) 0%, transparent 70%)`
            : `radial-gradient(circle, rgba(0,229,255,${(0.08 + influence * 0.35).toFixed(3)}) 0%, transparent 70%)`,
        }}
      />

      {/* Outer ring glow */}
      <div className="absolute inset-0 rounded-full transition-all duration-1000 pointer-events-none"
        style={{
          boxShadow: `0 0 ${(60 + influence * 120).toFixed(0)}px ${arc(glowColor, (0.12 + influence * 0.4).toFixed(3))}, 0 0 ${(120 + influence * 180).toFixed(0)}px ${arc(glowColor, (0.04 + influence * 0.15).toFixed(3))}`,
        }}
      />

      {/* Main outer segmented ring */}
      <div className="absolute inset-0 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 360 360" className="animate-rotateRing"
          style={{ animationDuration: `${(12 / ringSpeedMult).toFixed(1)}s` }}>
          <defs>
            <filter id="ringGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="strutGlow">
              <feGaussianBlur stdDeviation="1.5"/>
            </filter>
          </defs>
          {Array.from({ length: SEGMENT_COUNT }).map((_, i) => {
            const startAngle = (i * 360) / SEGMENT_COUNT
            const endAngle = startAngle + 300 / SEGMENT_COUNT
            const startRad = (startAngle - 90) * Math.PI / 180
            const endRad = (endAngle - 90) * Math.PI / 180
            const r = 165
            const x1 = 180 + r * Math.cos(startRad)
            const y1 = 180 + r * Math.sin(startRad)
            const x2 = 180 + r * Math.cos(endRad)
            const y2 = 180 + r * Math.sin(endRad)
            const largeArc = (endAngle - startAngle) > 180 ? 1 : 0
            return (
              <path key={`seg-${i}`}
                d={`M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`}
                fill="none"
                stroke={primaryColor}
                strokeWidth={2.5 + influence * 1.5}
                strokeOpacity={0.25 + influence * 0.45}
                strokeLinecap="round"
                filter="url(#ringGlow)"
              />
            )
          })}
        </svg>
      </div>

      {/* Second ring - thinner, counter-rotating */}
      <div className="absolute inset-3 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 360 360" className="animate-rotateRing"
          style={{ animationDuration: `${(10 / ringSpeedMult).toFixed(1)}s`, animationDirection: 'reverse' }}>
          <circle cx="180" cy="180" r="157" fill="none" stroke={primaryColor}
            strokeWidth="1" strokeOpacity={0.12 + influence * 0.2}
            strokeDasharray={`${outerCirc * 0.3} ${outerCirc * 0.7}`}
            filter="url(#ringGlow)"
          />
        </svg>
      </div>

      {/* Third ring - solid */}
      <div className="absolute inset-6 rounded-full pointer-events-none"
        style={{
          border: `1.5px solid ${isError ? `rgba(251,113,133,${(0.08 + influence * 0.2).toFixed(3)})` : `rgba(0,229,255,${(0.08 + influence * 0.2).toFixed(3)})`}`,
          animation: `rotateRing ${(7 / ringSpeedMult).toFixed(1)}s linear infinite`,
          animationDirection: 'reverse',
          boxShadow: audioLevel > 0.05
            ? `0 0 ${(8 + audioLevel * 20).toFixed(0)}px ${arc(glowColor, (0.04 + audioLevel * 0.2).toFixed(3))}`
            : 'none',
        }}
      />

      {/* Inner rings */}
      <div className="absolute inset-12 rounded-full pointer-events-none"
        style={{
          border: `1px solid ${isError ? `rgba(251,113,133,${(0.06 + influence * 0.15).toFixed(3)})` : `rgba(0,229,255,${(0.06 + influence * 0.15).toFixed(3)})`}`,
          animation: `rotateRing ${(5 / ringSpeedMult).toFixed(1)}s linear infinite`,
        }}
      />
      <div className="absolute inset-[88px] rounded-full pointer-events-none"
        style={{
          border: `1px dashed ${isError ? `rgba(251,113,133,${(0.08 + influence * 0.18).toFixed(3)})` : `rgba(0,229,255,${(0.08 + influence * 0.18).toFixed(3)})`}`,
          animation: `rotateRing ${(3.5 / ringSpeedMult).toFixed(1)}s linear infinite`,
          animationDirection: 'reverse',
        }}
      />

      {/* Radial struts */}
      <div className="absolute inset-0 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 360 360">
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8
            const rad = (angle * Math.PI) / 180
            const x2 = 180 + Math.cos(rad) * 160
            const y2 = 180 + Math.sin(rad) * 160
            return (
              <line key={`strut-${i}`} x1="180" y1="180" x2={x2.toFixed(1)} y2={y2.toFixed(1)}
                stroke={primaryColor} strokeWidth="1"
                strokeOpacity={(0.06 + influence * 0.12).toFixed(3)}
                filter="url(#strutGlow)"
                style={{ animation: `pulseOpacity ${(2.5 + i * 0.4).toFixed(1)}s ease-in-out infinite`, animationDelay: `${(i * 0.3).toFixed(1)}s` }}
              />
            )
          })}
        </svg>
      </div>

      {/* Orbital ellipses (3D sphere wireframe) */}
      {orbitConfigs.map((orbit, i) => (
        <div key={`orbit-${i}`} className="absolute inset-0 pointer-events-none"
          style={{
            transform: `rotate(${orbit.tilt}deg)`,
            animation: `rotateRing ${(orbit.dur / ringSpeedMult).toFixed(1)}s linear infinite`,
            animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
          }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: orbit.rx * 2,
              height: orbit.ry * 2,
              borderRadius: '50%',
              border: `1px solid ${isError ? `rgba(251,113,133,${(0.05 + influence * 0.1).toFixed(3)})` : `rgba(0,229,255,${(0.05 + influence * 0.1).toFixed(3)})`}`,
            }}
          />
          {Array.from({ length: ORBITAL_DOTS }).map((_, j) => {
            const dotAngle = (j * 360) / ORBITAL_DOTS
            const dotRad = (dotAngle * Math.PI) / 180
            const dx = Math.cos(dotRad) * orbit.rx
            const dy = Math.sin(dotRad) * orbit.ry
            const dotDur = orbit.dur / ringSpeedMult
            return (
              <div key={`dot-${i}-${j}`}
                className="absolute w-[3px] h-[3px] rounded-full"
                style={{
                  background: isError ? '#FB7185' : '#00E5FF',
                  left: `calc(50% + ${dx.toFixed(0)}px)`,
                  top: `calc(50% + ${dy.toFixed(0)}px)`,
                  transform: 'translate(-50%, -50%)',
                  opacity: (0.25 + (j / ORBITAL_DOTS) * 0.3 + influence * 0.3).toFixed(3),
                  boxShadow: `0 0 ${(3 + influence * 8).toFixed(0)}px ${arc(glowColor, (0.3 + influence * 0.5).toFixed(3))}`,
                  animation: `pulseOpacity ${(dotDur * 0.4).toFixed(2)}s ease-in-out ${(j * (dotDur / ORBITAL_DOTS)).toFixed(2)}s infinite`,
                }}
              />
            )
          })}
        </div>
      ))}

      {/* Center core */}
      <div className="absolute inset-[28%] pointer-events-none"
        style={{ animation: `corePulse ${pulseSpeed.toFixed(2)}s ease-in-out infinite` }}>
        <div className="w-full h-full rounded-full transition-all duration-500"
          style={{
            background: isError
              ? 'radial-gradient(ellipse at 40% 35%, rgba(251,113,133,0.8) 0%, rgba(251,113,133,0.4) 30%, rgba(251,113,133,0.1) 60%, transparent 100%)'
              : `radial-gradient(ellipse at 40% 35%, rgba(255,255,255,${(0.8 + influence * 0.2).toFixed(3)}) 0%, rgba(0,229,255,${(0.7 + influence * 0.3).toFixed(3)}) 20%, rgba(37,99,235,${(0.4 + influence * 0.3).toFixed(3)}) 50%, transparent 100%)`,
            boxShadow: isError
              ? '0 0 60px rgba(251,113,133,0.5), inset 0 0 30px rgba(251,113,133,0.2)'
              : `0 0 ${(50 + influence * 70).toFixed(0)}px ${arc(glowColor, (0.3 + influence * 0.5).toFixed(3))}, inset 0 0 ${(25 + influence * 25).toFixed(0)}px ${arc(glowColor, (0.15 + influence * 0.15).toFixed(3))}`,
          }}
        />
      </div>

      {/* Core bright point */}
      <div className="absolute inset-[44%] rounded-full pointer-events-none"
        style={{
          background: isError
            ? 'radial-gradient(ellipse at center, rgba(251,113,133,0.9) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(0,229,255,0.7) 25%, transparent 70%)',
          boxShadow: isError
            ? '0 0 30px rgba(251,113,133,0.6)'
            : `0 0 ${(25 + influence * 35).toFixed(0)}px ${arc(glowColor, (0.4 + influence * 0.5).toFixed(3))}`,
          transition: 'all 300ms',
        }}
      />

      {/* Ripple effects */}
      {ripples.map((id) => (
        <div key={`ripple-${id}`}
          className="absolute rounded-full border pointer-events-none"
          style={{
            inset: 60,
            borderColor: arc(glowColor, '0.35'),
            animation: 'rippleExpand 1.2s ease-out forwards',
          }}
        />
      ))}

      {/* Particles */}
      {Array.from({ length: 24 }).map((_, i) => {
        const size = 1 + (i % 3) * 0.6
        const px = randoms[i * 2] !== undefined ? -170 + randoms[i * 2] * 340 : 0
        const py = randoms[i * 2 + 1] !== undefined ? -170 + randoms[i * 2 + 1] * 340 : 0
        const dur = (4 + (i % 4) * 1.5) / Math.max(0.3, 1 + influence * 0.6)
        return (
          <div key={`p-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: size,
              height: size,
              background: isError ? '#FB7185' : '#00E5FF',
              left: `calc(50% + ${px.toFixed(0)}px)`,
              top: `calc(50% + ${py.toFixed(0)}px)`,
              opacity: (0.08 + (i % 5) * 0.04 + influence * 0.2).toFixed(3),
              animation: `particleFloat ${dur.toFixed(1)}s ease-in-out ${(i * 0.25).toFixed(2)}s infinite`,
              boxShadow: `0 0 ${(size * 2 + influence * 8).toFixed(0)}px ${arc(glowColor, (0.12 + influence * 0.35).toFixed(3))}`,
            }}
          />
        )
      })}

      {/* Scan line */}
      <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
        <div className="absolute left-8 right-8 h-[1px]"
          style={{
            background: `linear-gradient(to right, transparent, ${primaryColor}, transparent)`,
            opacity: (0.08 + influence * 0.2).toFixed(3),
            animation: 'scanLine 3.5s linear infinite',
          }}
        />
      </div>

      {/* Error flash */}
      {isError && (
        <div className="absolute inset-0 rounded-full animate-ping pointer-events-none"
          style={{ background: 'rgba(251,113,133,0.15)', animationDuration: '2s' }} />
      )}

      {/* Executing glow */}
      {state === 'executing' && (
        <div className="absolute -inset-4 rounded-full pointer-events-none"
          style={{
            border: '1px solid rgba(34,197,94,0.25)',
            boxShadow: `0 0 ${(20 + audioLevel * 25).toFixed(0)}px rgba(34,197,94,${(0.08 + audioLevel * 0.2).toFixed(3)})`,
            animation: 'pulseOpacity 1.5s ease-in-out infinite',
          }}
        />
      )}

      {/* State indicator */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full"
            style={{
              background: isError ? '#FB7185' : '#00E5FF',
              boxShadow: `0 0 ${(4 + influence * 8).toFixed(0)}px ${arc(glowColor, (0.4 + influence * 0.5).toFixed(3))}`,
              animation: `pulseOpacity ${(1 - influence * 0.4).toFixed(2)}s ease-in-out infinite`,
            }}
          />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase"
            style={{ color: isError ? 'rgba(251,113,133,0.5)' : 'rgba(125,211,252,0.45)' }}>
            {state}
            {audioLevel > 0.03 && state === 'idle' && (
              <span className="text-[7px] opacity-40 ml-1.5 tracking-[0.15em] font-light">· AMBIENT</span>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
