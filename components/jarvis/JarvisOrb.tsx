'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useJarvis } from './VoiceAssistant'
import OrbGlow from './orb/OrbGlow'
import OrbRings from './orb/OrbRings'
import OrbCore from './orb/OrbCore'
import OrbParticles from './orb/OrbParticles'
import OrbEffects from './orb/OrbEffects'

type OrbState = 'idle' | 'listening' | 'processing' | 'speaking' | 'executing' | 'error'

interface JarvisOrbProps {
  state?: OrbState
}

export default function JarvisOrb({ state = 'idle' }: JarvisOrbProps) {
  const { audioLevel } = useJarvis()
  const [mounted, setMounted] = useState(false)
  const prevLevelRef = useRef(0)
  const [ripples, setRipples] = useState<number[]>([])
  const rippleIdRef = useRef(0)

  const randoms = useMemo(() => Array.from({ length: 60 }, () => Math.random()), [])

  useEffect(() => { setMounted(true) }, [])

  const isActive = state !== 'idle' && state !== 'error'
  const influence = isActive ? audioLevel : audioLevel * 0.15
  const isError = state === 'error'
  const isSpeaking = state === 'speaking'
  const isListening = state === 'listening'
  const isProcessing = state === 'processing'

  const pulseSpeed = isActive
    ? Math.max(0.2, (isSpeaking ? 0.25 : isListening ? 0.35 : 0.5) - influence * 0.15)
    : 3.5 - influence * 1.5

  const ringSpeedMult = isActive
    ? Math.max(0.3, 2 + influence * 4)
    : Math.max(0.3, 0.6 + influence * 1.5)

  const coreBrightness = isActive
    ? 0.7 + influence * 0.3
    : 0.5 + influence * 0.15

  const whiteCore = isActive
    ? 0.85 + influence * 0.15
    : 0.6 + influence * 0.1

  const outerGlowSize = isActive
    ? 100 + influence * 120
    : 50 + influence * 40

  const outerGlowIntensity = isActive
    ? 0.25 + influence * 0.45
    : 0.08 + influence * 0.12

  useEffect(() => {
    const threshold = isActive ? 0.03 : 0.15
    if (audioLevel > threshold && audioLevel > prevLevelRef.current * 1.3) {
      const id = rippleIdRef.current++
      setRipples(prev => [...prev.slice(-3), id])
      setTimeout(() => setRipples(prev => prev.filter(r => r !== id)), isActive ? 800 : 1400)
    }
    prevLevelRef.current = audioLevel
  }, [audioLevel, isActive])

  if (!mounted) return <div className="relative flex items-center justify-center w-[360px] h-[360px]" />

  const primaryColor = isError ? '#FB7185' : '#00E5FF'
  const glowColor = isError ? 'rgba(251,113,133,{o})' : 'rgba(0,229,255,{o})'

  return (
    <div className="relative flex items-center justify-center w-[360px] h-[360px]">
      <OrbGlow
        influence={influence}
        isActive={isActive}
        isError={isError}
        isProcessing={isProcessing}
        state={state}
        primaryColor={primaryColor}
        glowColor={glowColor}
        outerGlowSize={outerGlowSize}
        outerGlowIntensity={outerGlowIntensity}
      />
      <OrbRings
        isActive={isActive}
        isError={isError}
        influence={influence}
        ringSpeedMult={ringSpeedMult}
        primaryColor={primaryColor}
        pulseSpeed={pulseSpeed}
      />
      <OrbCore
        isActive={isActive}
        isError={isError}
        influence={influence}
        pulseSpeed={pulseSpeed}
        coreBrightness={coreBrightness}
        whiteCore={whiteCore}
        glowColor={glowColor}
      />
      <OrbParticles
        isActive={isActive}
        isError={isError}
        influence={influence}
        audioLevel={audioLevel}
        primaryColor={primaryColor}
        glowColor={glowColor}
        randoms={randoms}
      />
      <OrbEffects
        isActive={isActive}
        isError={isError}
        influence={influence}
        state={state}
        primaryColor={primaryColor}
        glowColor={glowColor}
        ripples={ripples}
      />
    </div>
  )
}
