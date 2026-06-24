'use client'

interface Props {
  isActive: boolean
  isError: boolean
  influence: number
  pulseSpeed: number
  coreBrightness: number
  whiteCore: number
  glowColor: string
}

function arc(c: string, o: string) { return c.replace('{o}', o) }

export default function OrbCore({ isActive, isError, influence, pulseSpeed, coreBrightness, whiteCore, glowColor }: Props) {
  return (
    <>
      {/* Center core */}
      <div className="absolute inset-[28%] pointer-events-none"
        style={{
          animation: isActive
            ? `activePulse ${pulseSpeed.toFixed(2)}s ease-in-out infinite`
            : `idlePulse ${pulseSpeed.toFixed(2)}s ease-in-out infinite`,
        }}>
        <div className="w-full h-full rounded-full transition-all duration-500"
          style={{
            background: isError
              ? 'radial-gradient(ellipse at 40% 35%, rgba(251,113,133,0.8) 0%, rgba(251,113,133,0.4) 30%, rgba(251,113,133,0.1) 60%, transparent 100%)'
              : isActive
                ? `radial-gradient(ellipse at 40% 35%, rgba(255,255,255,${whiteCore.toFixed(3)}) 0%, rgba(0,229,255,${(0.85 + influence * 0.15).toFixed(3)}) 20%, rgba(37,99,235,${(0.5 + influence * 0.3).toFixed(3)}) 50%, transparent 100%)`
                : `radial-gradient(ellipse at 40% 35%, rgba(255,255,255,${whiteCore.toFixed(3)}) 0%, rgba(0,229,255,${coreBrightness.toFixed(3)}) 20%, rgba(37,99,235,${(0.3 + influence * 0.15).toFixed(3)}) 50%, transparent 100%)`,
            boxShadow: isError
              ? '0 0 60px rgba(251,113,133,0.5), inset 0 0 30px rgba(251,113,133,0.2)'
              : isActive
                ? `0 0 ${(60 + influence * 80).toFixed(0)}px ${arc(glowColor, (0.4 + influence * 0.5).toFixed(3))}, inset 0 0 ${(30 + influence * 30).toFixed(0)}px ${arc(glowColor, (0.2 + influence * 0.2).toFixed(3))}`
                : `0 0 ${(30 + influence * 30).toFixed(0)}px ${arc(glowColor, (0.2 + influence * 0.2).toFixed(3))}, inset 0 0 ${(15 + influence * 10).toFixed(0)}px ${arc(glowColor, (0.08 + influence * 0.08).toFixed(3))}`,
          }}
        />
      </div>

      {/* Core bright point */}
      <div className="absolute inset-[44%] rounded-full pointer-events-none"
        style={{
          background: isError
            ? 'radial-gradient(ellipse at center, rgba(251,113,133,0.9) 0%, transparent 70%)'
            : isActive
              ? 'radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(0,229,255,0.85) 25%, transparent 70%)'
              : 'radial-gradient(ellipse at center, rgba(255,255,255,0.85) 0%, rgba(0,229,255,0.5) 25%, transparent 70%)',
          boxShadow: isError
            ? '0 0 30px rgba(251,113,133,0.6)'
            : isActive
              ? `0 0 ${(35 + influence * 45).toFixed(0)}px ${arc(glowColor, (0.5 + influence * 0.5).toFixed(3))}`
              : `0 0 ${(15 + influence * 15).toFixed(0)}px ${arc(glowColor, (0.25 + influence * 0.2).toFixed(3))}`,
          transition: 'all 300ms',
          animation: isActive ? `coreFlash ${(0.4 - influence * 0.15).toFixed(2)}s ease-in-out infinite` : 'none',
        }}
      />
    </>
  )
}
