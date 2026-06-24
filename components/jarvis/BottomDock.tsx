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

export default function BottomDock() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto inline-flex items-center gap-1 px-3 py-2 mb-3 rounded-2xl border-t border-panel-border/60 bg-panel-bg/80 backdrop-blur-xl shadow-[0_-4px_30px_rgba(0,0,0,0.5),0_-1px_0_rgba(0,229,255,0.15)]">
        {dockItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl
                transition-all duration-200 ease-out group
                ${
                  isActive
                    ? 'bg-primary-glow/10 text-primary-glow'
                    : 'text-hud-muted/40 hover:text-hud-muted/70 hover:bg-white/[0.03]'
                }
              `.trim()}
            >
              {isActive && (
                <span className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-primary-glow shadow-[0_0_6px_rgba(0,229,255,0.6)]" />
              )}
              <span
                className={`text-lg transition-transform duration-200 ${
                  isActive ? 'scale-110 drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]' : ''
                } group-hover:scale-105`}
              >
                {item.icon}
              </span>
              <span
                className={`text-[9px] font-mono tracking-wider uppercase whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'text-primary-glow/80 opacity-100'
                    : 'opacity-0 group-hover:opacity-60'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* Decorative side glows */}
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary-glow/5 blur-xl rounded-full" />
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary-glow/5 blur-xl rounded-full" />
      </div>
    </div>
  )
}
