'use client'

interface Props {
  isActive: boolean
  isError: boolean
  influence: number
  audioLevel: number
  primaryColor: string
  glowColor: string
  randoms: number[]
}

function arc(c: string, o: string) { return c.replace('{o}', o) }

export default function OrbParticles({ isActive, isError, influence, audioLevel, primaryColor, glowColor, randoms }: Props) {
  return (
    <>
      {/* Spectrum bars */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full" style={{ opacity: isActive ? 1 : 0.2 }}>
          {Array.from({ length: 48 }).map((_, i) => {
            const angle = (i * 360) / 48
            const rad = (angle * Math.PI) / 180
            const barRadius = isActive ? 170 : 160
            const x = Math.cos(rad) * barRadius
            const y = Math.sin(rad) * barRadius
            const barHeight = isActive
              ? 2 + audioLevel * (20 + randoms[i % 30] * 25)
              : 1 + audioLevel * (4 + randoms[i % 30] * 3)
            const barWidth = isActive ? 3 : 1.5
            return (
              <div key={`spec-${i}`}
                className="absolute rounded-full"
                style={{
                  width: barWidth, height: barHeight,
                  background: isError ? '#FB7185' : '#00E5FF',
                  left: `calc(50% + ${x.toFixed(0)}px)`,
                  top: `calc(50% + ${y.toFixed(0)}px)`,
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${barHeight / 2}px)`,
                  opacity: isActive ? (0.2 + audioLevel * 0.6) : (0.04 + audioLevel * 0.08),
                  boxShadow: isActive && audioLevel > 0.05
                    ? `0 0 ${(3 + audioLevel * 10).toFixed(0)}px ${arc(glowColor, (audioLevel * 0.5).toFixed(3))}`
                    : 'none',
                  transition: 'height 40ms, opacity 80ms',
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Data stream particles */}
      {isActive && Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 360) / 12
        const rad = (angle * Math.PI) / 180
        const dist = 60 + randoms[i] * 60
        const px = Math.cos(rad) * dist
        const py = Math.sin(rad) * dist
        const size = 2 + randoms[i + 12] * 2
        const dx = (Math.cos(rad + Math.PI * 0.5) * 40).toFixed(0)
        const dy = (Math.sin(rad + Math.PI * 0.5) * 40).toFixed(0)
        return (
          <div key={`stream-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: size, height: size,
              background: '#00E5FF',
              left: `calc(50% + ${px.toFixed(0)}px)`,
              top: `calc(50% + ${py.toFixed(0)}px)`,
              opacity: (0.3 + influence * 0.5).toFixed(3),
              '--dx': `${dx}px`, '--dy': `${dy}px`,
              animation: `dataStream ${(1 + randoms[i] * 1.5).toFixed(1)}s linear ${(randoms[i + 24] * 0.5).toFixed(2)}s infinite`,
              boxShadow: `0 0 ${(4 + influence * 8).toFixed(0)}px ${arc(glowColor, (0.4 + influence * 0.4).toFixed(3))}`,
            } as React.CSSProperties}
          />
        )
      })}

      {/* Floating particles */}
      {Array.from({ length: isActive ? 30 : 15 }).map((_, i) => {
        const size = isActive ? 1 + (i % 3) * 0.8 : 1 + (i % 2) * 0.4
        const px = randoms[i * 2] !== undefined ? -170 + randoms[i * 2] * 340 : 0
        const py = randoms[i * 2 + 1] !== undefined ? -170 + randoms[i * 2 + 1] * 340 : 0
        const dur = isActive
          ? (2 + (i % 4) * 1) / Math.max(0.3, 1 + influence * 0.8)
          : (5 + (i % 4) * 2) / Math.max(0.3, 1 + influence * 0.3)
        return (
          <div key={`p-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: size, height: size,
              background: isError ? '#FB7185' : '#00E5FF',
              left: `calc(50% + ${px.toFixed(0)}px)`,
              top: `calc(50% + ${py.toFixed(0)}px)`,
              opacity: isActive
                ? (0.15 + (i % 5) * 0.06 + influence * 0.25).toFixed(3)
                : (0.05 + (i % 5) * 0.02 + influence * 0.08).toFixed(3),
              animation: `particleFloat ${dur.toFixed(1)}s ease-in-out ${(i * (isActive ? 0.12 : 0.3)).toFixed(2)}s infinite`,
              boxShadow: isActive
                ? `0 0 ${(size * 2 + influence * 10).toFixed(0)}px ${arc(glowColor, (0.15 + influence * 0.4).toFixed(3))}`
                : `0 0 ${(size * 0.5 + influence * 2).toFixed(0)}px ${arc(glowColor, (0.05 + influence * 0.1).toFixed(3))}`,
            }}
          />
        )
      })}
    </>
  )
}
