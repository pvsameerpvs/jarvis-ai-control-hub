'use client'

interface Props {
  influence: number
  isActive: boolean
  isError: boolean
  isProcessing: boolean
  state: string
  primaryColor: string
  glowColor: string
  outerGlowSize: number
  outerGlowIntensity: number
}

function arc(c: string, o: string) { return c.replace('{o}', o) }

export default function OrbGlow({
  influence, isActive, isError, isProcessing,
  state, primaryColor, glowColor, outerGlowSize, outerGlowIntensity,
}: Props) {
  return (
    <>
      <div className="absolute inset-0 rounded-full blur-[100px] transition-all duration-1000 pointer-events-none"
        style={{
          background: isError
            ? `radial-gradient(circle, rgba(251,113,133,${(0.12 + influence * 0.25).toFixed(3)}) 0%, transparent 70%)`
            : isActive
              ? `radial-gradient(circle, rgba(0,229,255,${(0.12 + influence * 0.4).toFixed(3)}) 0%, rgba(37,99,235,${(0.05 + influence * 0.15).toFixed(3)}) 50%, transparent 70%)`
              : `radial-gradient(circle, rgba(0,229,255,${(0.05 + influence * 0.15).toFixed(3)}) 0%, transparent 70%)`,
          transform: isActive ? 'scale(1.1)' : 'scale(1)',
        }}
      />
      <div className="absolute inset-0 rounded-full transition-all duration-1000 pointer-events-none"
        style={{
          boxShadow: isError
            ? `0 0 80px rgba(251,113,133,0.3), 0 0 160px rgba(251,113,133,0.15)`
            : `0 0 ${outerGlowSize.toFixed(0)}px ${arc(glowColor, outerGlowIntensity.toFixed(3))}, 0 0 ${(outerGlowSize * 1.5).toFixed(0)}px ${arc(glowColor, (outerGlowIntensity * 0.4).toFixed(3))}`,
        }}
      />
      {isProcessing && (
        <div className="absolute -inset-2 rounded-full pointer-events-none"
          style={{
            border: '1.5px solid rgba(0,229,255,0.2)',
            borderTopColor: 'rgba(0,229,255,0.6)',
            boxShadow: `0 0 15px rgba(0,229,255,${(0.05 + influence * 0.15).toFixed(3)})`,
            animation: 'rotateRing 0.8s linear infinite',
          }}
        />
      )}
      {isError && (
        <div className="absolute inset-0 rounded-full animate-ping pointer-events-none"
          style={{ background: 'rgba(251,113,133,0.15)', animationDuration: '2s' }} />
      )}
      {state === 'executing' && (
        <div className="absolute -inset-4 rounded-full pointer-events-none"
          style={{
            border: '1px solid rgba(34,197,94,0.25)',
            boxShadow: `0 0 ${(20 + influence * 25).toFixed(0)}px rgba(34,197,94,${(0.08 + influence * 0.2).toFixed(3)})`,
            animation: 'pulseOpacity 1.5s ease-in-out infinite',
          }}
        />
      )}
    </>
  )
}
