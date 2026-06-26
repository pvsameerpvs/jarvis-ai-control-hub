'use client'

import { type ReactNode } from 'react'
import BottomDock from './BottomDock'
import { useJarvis } from './VoiceAssistant'

interface HudPageLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  badge?: ReactNode
  headerRight?: ReactNode
}

function CornerBracket({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const styles: Record<string, string> = {
    tl: 'top-0 left-0',
    tr: 'top-0 right-0',
    bl: 'bottom-0 left-0 rotate-180',
    br: 'bottom-0 right-0 rotate-180',
  }

  return (
    <svg
      className={`absolute ${styles[position]} w-4 h-4 text-primary-glow/20 pointer-events-none`}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path d="M15 1H1V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PageGlow() {
  return (
    <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-glow/[0.02] rounded-full blur-[150px] pointer-events-none" />
  )
}

export default function HudPageLayout({
  children,
  title,
  subtitle,
  badge,
  headerRight,
}: HudPageLayoutProps) {
  const { voiceEnabled } = useJarvis()

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <PageGlow />

      {/* Scan lines */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.015]
        bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,229,255,0.03)_2px,rgba(0,229,255,0.03)_4px)]" />

      {/* Side glows */}
      <div className="fixed top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-primary-glow/10 to-transparent pointer-events-none" />
      <div className="fixed top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-primary-glow/10 to-transparent pointer-events-none" />

      <div className="relative z-10 min-h-screen flex flex-col pb-24">
        {/* Header */}
        <header className="relative shrink-0">
          <div className="h-px bg-gradient-to-r from-transparent via-primary-glow/30 to-transparent shadow-[0_0_8px_rgba(0,229,255,0.1)]" />
          <div className="relative flex items-center justify-between px-6 py-3 bg-[#0a0e1a]/60 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-[2px] h-5 bg-primary-glow rounded-full shadow-[0_0_8px_rgba(0,229,255,0.3)]" />
                <h1 className="text-sm font-mono text-primary-glow font-bold tracking-[0.15em] drop-shadow-[0_0_12px_rgba(0,229,255,0.2)]">
                  {title}
                </h1>
              </div>
              {subtitle && (
                <span className="text-[9px] font-mono text-primary-glow/30 tracking-[0.2em] uppercase border-l border-primary-glow/15 pl-4">
                  {subtitle}
                </span>
              )}
              {badge}
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-mono text-[8px] tracking-[0.15em] uppercase ${voiceEnabled ? 'text-primary-glow/50' : 'text-[#FB7185]/60'}`}>
                {voiceEnabled ? 'POWER:ON' : 'POWER:OFF'}
              </span>
              {headerRight}
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-primary-glow/15 to-transparent" />
        </header>

        {/* Corner brackets around header */}
        <CornerBracket position="tl" />
        <CornerBracket position="tr" />

        {/* Content */}
        <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full space-y-6 relative">
          {voiceEnabled ? (
            children
          ) : (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="border border-[#FB7185]/20 rounded-lg p-6 bg-[#0a0e1a]/60 text-center">
                <span className="text-3xl text-[#FB7185]/40 block mb-3">◈</span>
                <p className="font-mono text-sm text-[#FB7185]/70 tracking-[0.15em] uppercase mb-1">System Powered Off</p>
                <p className="font-mono text-[9px] text-[#FB7185]/30 tracking-[0.1em]">Return to Dashboard to enable</p>
              </div>
            </div>
          )}
        </main>
      </div>

      <BottomDock />
    </div>
  )
}
