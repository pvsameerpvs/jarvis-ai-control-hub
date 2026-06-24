'use client'

interface Props {
  isActive: boolean
  isError: boolean
  influence: number
  state: string
  primaryColor: string
  glowColor: string
  ripples: number[]
}

function arc(c: string, o: string) { return c.replace('{o}', o) }

export default function OrbEffects({ isActive, isError, influence, state, primaryColor, glowColor, ripples }: Props) {
  return (
    <>
      {/* Ripple effects */}
      {ripples.map((id) => (
        <div key={`ripple-${id}`}
          className="absolute rounded-full border pointer-events-none"
          style={{
            inset: isActive ? 40 : 60,
            borderColor: arc(glowColor, isActive ? '0.5' : '0.2'),
            borderWidth: isActive ? 1.5 : 1,
            animation: isActive ? 'rippleFast 0.8s ease-out forwards' : 'rippleExpand 1.4s ease-out forwards',
          }}
        />
      ))}

      {/* Scan line */}
      <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
        <div className="absolute left-8 right-8 h-[1px]"
          style={{
            background: `linear-gradient(to right, transparent, ${primaryColor}, transparent)`,
            opacity: isActive ? (0.2 + influence * 0.3).toFixed(3) : (0.04 + influence * 0.06).toFixed(3),
            animation: isActive ? 'scanLine 2s linear infinite' : 'scanLine 5s linear infinite',
          }}
        />
      </div>

      {/* State indicator */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full"
            style={{
              background: isError ? '#FB7185' : '#00E5FF',
              boxShadow: isActive
                ? `0 0 ${(6 + influence * 10).toFixed(0)}px ${arc(glowColor, (0.5 + influence * 0.5).toFixed(3))}`
                : `0 0 ${(2 + influence * 3).toFixed(0)}px ${arc(glowColor, (0.2 + influence * 0.2).toFixed(3))}`,
              animation: `pulseOpacity ${(isActive ? 0.5 : 1.5).toFixed(2)}s ease-in-out infinite`,
            }}
          />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase"
            style={{ color: isError ? 'rgba(251,113,133,0.5)' : 'rgba(125,211,252,0.45)' }}>
            {state}
          </span>
        </div>
      </div>
    </>
  )
}
