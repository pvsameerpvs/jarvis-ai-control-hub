'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface DockItem {
  label: string
  path: string
  icon: string
}

const dockItems: DockItem[] = [
  { label: 'Dashboard', path: '/', icon: '◈' },
  { label: 'Camera', path: '/camera', icon: '◉' },
  { label: 'Gmail', path: '/gmail', icon: '◎' },
  { label: 'Telegram', path: '/telegram', icon: '◉' },
  { label: 'Browser', path: '/browser', icon: '◇' },
  { label: 'Connectors', path: '/connectors', icon: '◆' },
  { label: 'Settings', path: '/settings', icon: '⚙' },
]

function Corner({ side }: { side: 'tl' | 'tr' | 'bl' | 'br' }) {
  const rotations: Record<string, string> = {
    tl: 'rotate-0',
    tr: 'rotate-90',
    bl: 'rotate-270',
    br: 'rotate-180',
  }
  return (
    <svg className={`absolute w-3 h-3 ${rotations[side]}`} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0H0V12" stroke="url(#corner-grad)" strokeWidth="1.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="corner-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(0,229,255,0.4)" />
          <stop offset="100%" stopColor="rgba(0,229,255,0)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function BottomDock() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      {/* Full-width bar */}
      <div className="relative w-full max-w-[820px] pointer-events-auto mx-auto px-1.5">
        {/* Corner accents */}
        <div className="absolute -top-px -left-px">
          <Corner side="tl" />
        </div>
        <div className="absolute -top-px -right-px">
          <Corner side="tr" />
        </div>

        {/* Top accent line */}
        <div className="absolute -top-px left-3 right-3 h-px bg-gradient-to-r from-transparent via-primary-glow/40 to-transparent" />

        {/* Bar body */}
        <div className="relative flex items-center justify-between px-2 py-1.5 mb-2
          bg-[#020617]/90 backdrop-blur-xl
          border border-primary-glow/10
          shadow-[0_-4px_30px_rgba(0,0,0,0.6),0_0_30px_rgba(0,229,255,0.03),inset_0_1px_0_rgba(0,229,255,0.05)]">

          {/* Left status indicator */}
          <div className="flex items-center gap-2 pl-1">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-glow shadow-[0_0_6px_rgba(0,229,255,0.6)] animate-pulse" />
              <span className="text-[8px] font-mono text-primary-glow/50 tracking-[0.15em] uppercase hidden sm:inline-block">
                XENA
              </span>
            </span>
            <span className="text-[8px] font-mono text-primary-glow/20 tracking-[0.2em] hidden md:inline-block">
              │
            </span>
            <span className="text-[8px] font-mono text-primary-glow/25 tracking-[0.15em] uppercase hidden md:inline-block">
              neural link active
            </span>
          </div>

          {/* Navigation items */}
          <div className="flex items-center gap-0.5">
            {dockItems.map((item, i) => {
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`
                    relative flex items-center gap-1.5 px-2.5 py-1.5 rounded
                    transition-all duration-150 ease-out group
                    ${isActive
                      ? 'bg-primary-glow/8 text-primary-glow'
                      : 'text-hud-muted/30 hover:text-hud-muted/60 hover:bg-white/[0.02]'
                    }
                  `.trim()}
                >
                  {isActive && (
                    <span className="absolute -top-px left-2 right-2 h-[1.5px] rounded-full bg-primary-glow shadow-[0_0_6px_rgba(0,229,255,0.5)]" />
                  )}
                  <span className={`text-sm transition-all duration-150 ${isActive ? 'drop-shadow-[0_0_4px_rgba(0,229,255,0.4)]' : ''}`}>
                    {item.icon}
                  </span>
                  <span className={`text-[9px] font-mono tracking-wider uppercase transition-all duration-150 ${
                    isActive
                      ? 'text-primary-glow/70 opacity-100'
                      : 'opacity-0 group-hover:opacity-60 w-0 group-hover:w-auto overflow-hidden'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Right status */}
          <div className="flex items-center gap-2 pr-1">
            <span className="text-[8px] font-mono text-primary-glow/20 tracking-[0.2em] hidden lg:inline-block">
              SYS::NOMINAL
            </span>
            <span className="w-1 h-1 rounded-full bg-green-400/60 shadow-[0_0_4px_rgba(34,197,94,0.3)]" />
          </div>
        </div>

        {/* Bottom scan-line decoration */}
        <div className="absolute -bottom-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary-glow/15 to-transparent" />
      </div>
    </div>
  )
}
