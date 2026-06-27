'use client'

interface Props {
  isActive: boolean
  isError: boolean
  influence: number
  ringSpeedMult: number
  primaryColor: string
  pulseSpeed: number
}

const SEGMENT_COUNT = 8
const ORBITAL_DOTS = 8
const outerCirc = 2 * Math.PI * 165

const orbitConfigs = [
  { rx: 155, ry: 55, tilt: 0, dur: 12 },
  { rx: 155, ry: 45, tilt: 60, dur: 15 },
  { rx: 155, ry: 50, tilt: 120, dur: 10 },
  { rx: 100, ry: 30, tilt: 30, dur: 8 },
]

export default function OrbRings({ isActive, isError, influence, ringSpeedMult, primaryColor }: Props) {
  return (
    <>
      {/* Main outer segmented ring */}
      <div className="absolute inset-0 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 360 360"
          style={{
            animationName: 'rotateRing',
            animationDuration: `${(isActive ? 6 - influence * 2 : 20 - influence * 5).toFixed(1)}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationDirection: isActive ? 'normal' : 'reverse',
          }}>
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
            const endAngle = startAngle + (isActive ? 330 : 270) / SEGMENT_COUNT
            const startRad = (startAngle - 90) * Math.PI / 180
            const endRad = (endAngle - 90) * Math.PI / 180
            const r = 165
            const x1 = 180 + r * Math.cos(startRad)
            const y1 = 180 + r * Math.sin(startRad)
            const x2 = 180 + r * Math.cos(endRad)
            const y2 = 180 + r * Math.sin(endRad)
            const largeArc = (endAngle - startAngle) > 180 ? 1 : 0
            const segOpacity = isActive ? (0.35 + influence * 0.5).toFixed(3) : (0.12 + influence * 0.1).toFixed(3)
            const segWidth = isActive ? 3.5 + influence * 2 : 1.5 + influence * 0.5
            return (
              <path key={`seg-${i}`}
                d={`M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`}
                fill="none" stroke={primaryColor}
                strokeWidth={segWidth} strokeOpacity={segOpacity}
                strokeLinecap="round" filter="url(#ringGlow)"
              />
            )
          })}
        </svg>
      </div>

      {/* Second ring - thinner, counter-rotating */}
      <div className={`absolute inset-3 pointer-events-none ${isActive ? 'opacity-100' : 'opacity-40'}`}>
        <svg width="100%" height="100%" viewBox="0 0 360 360"
          style={{
            animationName: 'rotateRing',
            animationDuration: `${(isActive ? 5 - influence * 1.5 : 15 - influence * 3).toFixed(1)}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationDirection: isActive ? 'reverse' : 'normal',
          }}>
          <circle cx="180" cy="180" r="157" fill="none" stroke={primaryColor}
            strokeWidth={isActive ? 1.5 : 0.8}
            strokeOpacity={(isActive ? 0.2 : 0.06) + influence * 0.15}
            strokeDasharray={`${outerCirc * (isActive ? 0.4 : 0.2)} ${outerCirc * 0.6}`}
            filter="url(#ringGlow)"
          />
        </svg>
      </div>

      {/* Third ring - solid */}
      <div className="absolute inset-6 rounded-full pointer-events-none"
        style={{
          border: `${isActive ? 2 : 1}px solid ${isError ? `rgba(251,113,133,${(isActive ? 0.15 : 0.05 + influence * 0.1).toFixed(3)})` : `rgba(0,229,255,${(isActive ? 0.15 : 0.05 + influence * 0.1).toFixed(3)})`}`,
          animationName: 'rotateRing',
          animationDuration: `${(isActive ? 4 - influence * 1 : 10 - influence * 3).toFixed(1)}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationDirection: isActive ? 'reverse' : 'normal',
          boxShadow: isActive ? `0 0 ${(10 + influence * 25).toFixed(0)}px rgba(0,229,255,${(0.08 + influence * 0.25).toFixed(3)})` : 'none',
          opacity: isActive ? 1 : 0.5,
        }}
      />

      {/* Inner rings */}
      <div className={`absolute inset-12 rounded-full pointer-events-none ${isActive ? 'opacity-100' : 'opacity-30'}`}
        style={{
          border: `1px solid ${isError ? `rgba(251,113,133,${(0.08 + influence * 0.18).toFixed(3)})` : `rgba(0,229,255,${(0.08 + influence * 0.18).toFixed(3)})`}`,
          animation: `${(isActive ? 3 : 8).toFixed(1)}s linear infinite rotateRing`,
        }}
      />
      <div className="absolute inset-[88px] rounded-full pointer-events-none"
        style={{
          border: `1px dashed ${isError ? `rgba(251,113,133,${(0.06 + influence * 0.15).toFixed(3)})` : `rgba(0,229,255,${(0.06 + influence * 0.15).toFixed(3)})`}`,
          animationName: 'rotateRing',
          animationDuration: `${(isActive ? 2 : 5).toFixed(1)}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationDirection: 'reverse',
          opacity: isActive ? 1 : 0.4,
        }}
      />

      {/* Radial struts */}
      <div className="absolute inset-0 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 360 360">
          {Array.from({ length: isActive ? 12 : 6 }).map((_, i) => {
            const angle = (i * 360) / (isActive ? 12 : 6)
            const rad = (angle * Math.PI) / 180
            const x2 = 180 + Math.cos(rad) * (isActive ? 168 : 155)
            const y2 = 180 + Math.sin(rad) * (isActive ? 168 : 155)
            return (
              <line key={`strut-${i}`}
                x1="180" y1="180" x2={x2.toFixed(1)} y2={y2.toFixed(1)}
                stroke={primaryColor} strokeWidth={isActive ? 1.2 : 0.6}
                strokeOpacity={isActive ? (0.1 + influence * 0.15).toFixed(3) : (0.04 + influence * 0.06).toFixed(3)}
                filter="url(#strutGlow)"
                style={{
                  animation: `pulseOpacity ${(isActive ? 1.5 : 3 + i * 0.5).toFixed(1)}s ease-in-out infinite`,
                  animationDelay: `${(i * (isActive ? 0.12 : 0.4)).toFixed(2)}s`,
                }}
              />
            )
          })}
        </svg>
      </div>

      {/* Orbital ellipses */}
      {orbitConfigs.map((orbit, i) => {
        const orbSpeed = isActive
          ? (orbit.dur * 0.3) / Math.max(0.3, 1 + influence * 1.5)
          : orbit.dur * 1.5 - influence * 2
        return (
          <div key={`orbit-${i}`} className={`absolute inset-0 pointer-events-none ${isActive ? 'opacity-100' : 'opacity-30'}`}
            style={{
              transform: `rotate(${orbit.tilt}deg)`,
              animationName: 'rotateRing',
              animationDuration: `${orbSpeed.toFixed(1)}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
            }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: orbit.rx * 2, height: orbit.ry * 2, borderRadius: '50%',
                border: `1px solid ${isError ? `rgba(251,113,133,${(isActive ? 0.1 : 0.03).toFixed(3)})` : `rgba(0,229,255,${(isActive ? 0.1 : 0.03 + influence * 0.05).toFixed(3)})`}`,
              }}
            />
            {Array.from({ length: ORBITAL_DOTS }).map((_, j) => {
              const dotAngle = (j * 360) / ORBITAL_DOTS
              const dotRad = (dotAngle * Math.PI) / 180
              const dx = Math.cos(dotRad) * orbit.rx
              const dy = Math.sin(dotRad) * orbit.ry
              const dotDur = orbSpeed / ringSpeedMult
              return (
                <div key={`dot-${i}-${j}`}
                  className={`absolute rounded-full ${isActive ? 'w-[4px] h-[4px]' : 'w-[2px] h-[2px]'}`}
                  style={{
                    background: isError ? '#FB7185' : '#00E5FF',
                    left: `calc(50% + ${dx.toFixed(0)}px)`,
                    top: `calc(50% + ${dy.toFixed(0)}px)`,
                    transform: 'translate(-50%, -50%)',
                    opacity: isActive
                      ? (0.4 + (j / ORBITAL_DOTS) * 0.4 + influence * 0.3).toFixed(3)
                      : (0.1 + (j / ORBITAL_DOTS) * 0.1 + influence * 0.1).toFixed(3),
                    boxShadow: isActive
                      ? `0 0 ${(5 + influence * 10).toFixed(0)}px rgba(0,229,255,${(0.4 + influence * 0.5).toFixed(3)})`
                      : `0 0 ${(1 + influence * 2).toFixed(0)}px rgba(0,229,255,${(0.1 + influence * 0.15).toFixed(3)})`,
                    animation: isActive
                      ? `pulseOpacity ${(dotDur * 0.3).toFixed(2)}s ease-in-out ${(j * (dotDur / ORBITAL_DOTS)).toFixed(2)}s infinite`
                      : 'none',
                  }}
                />
              )
            })}
          </div>
        )
      })}
    </>
  )
}
