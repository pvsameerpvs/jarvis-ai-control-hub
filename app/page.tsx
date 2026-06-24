'use client'

import { useState, useEffect, useRef } from 'react'
import JarvisOrb from '@/components/jarvis/JarvisOrb'
import VoiceWaveform from '@/components/jarvis/VoiceWaveform'
import { JarvisProvider, useJarvis } from '@/components/jarvis/VoiceAssistant'
import VoiceAssistant from '@/components/jarvis/VoiceAssistant'
import ChatPanel from '@/components/jarvis/ChatPanel'
import SystemStatus from '@/components/jarvis/SystemStatus'
import ToolStatusPanel from '@/components/jarvis/ToolStatusPanel'
import BottomDock from '@/components/jarvis/BottomDock'
import TimePanel from '@/components/jarvis/TimePanel'

function HexGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 28
    let animationId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let time = 0

    const draw = () => {
      time += 0.005
      ctx.fillStyle = '#0a0e1a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const cols = Math.ceil(canvas.width / (size * 1.5)) + 1
      const rows = Math.ceil(canvas.height / (size * 1.732)) + 1

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * size * 1.5
          const y = row * size * 1.732 + (col % 2) * size * 0.866 + (time * 20 % (size * 1.732))

          const glow = Math.sin(x * 0.01 + y * 0.01 + time) * 0.5 + 0.5
          const alpha = 0.02 + glow * 0.04

          ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`
          ctx.lineWidth = 0.5

          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6
            const px = x + size * Math.cos(angle)
            const py = y + size * Math.sin(angle)
            if (i === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.closePath()
          ctx.stroke()
        }
      }

      animationId = requestAnimationFrame(draw)
    }

    animationId = requestAnimationFrame(draw)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
}

function CenterZone() {
  const { voiceState } = useJarvis()

  const orbState = voiceState === 'executing' ? 'executing'
    : voiceState === 'speaking' ? 'speaking'
    : voiceState === 'listening' ? 'listening'
    : voiceState === 'processing' ? 'processing'
    : 'idle'

  return (
    <div className="flex flex-col items-center justify-center gap-4 min-w-0 w-full max-w-[400px] mx-auto">
      <div className="relative flex items-center justify-center shrink-0">
        <div className="relative">
          <JarvisOrb state={orbState} />
        </div>
      </div>
      <div className="w-full shrink-0">
        <VoiceWaveform state={orbState} />
      </div>
      <div className="w-full shrink-0">
        <VoiceAssistant />
      </div>
    </div>
  )
}

function DashboardContent() {
  const { voiceState } = useJarvis()
  const [logs] = useState<Array<{ timestamp: string; text: string; type: 'info' | 'success' | 'error' | 'command' | 'system' }>>([
    { timestamp: '00:00:00', text: 'XENA neural interface initialized', type: 'system' },
    { timestamp: '00:00:01', text: 'All subsystems online', type: 'success' },
    { timestamp: '00:00:02', text: 'Awaiting command...', type: 'info' },
  ])
  const [toolActions] = useState([
    { toolName: 'System', status: 'completed' as const, timestamp: '00:00:02', description: 'Boot sequence complete' },
  ])

  return (
    <div className="h-screen bg-[#0a0e1a] relative overflow-hidden flex flex-col">
      <HexGrid />

      {/* Central glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none z-[1]" />

      {/* Scan lines */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.015]
        bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(59,130,246,0.03)_2px,rgba(59,130,246,0.03)_4px)]" />

      {/* Decorative side glows */}
      <div className="fixed top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent pointer-events-none z-[1]" />
      <div className="fixed top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent pointer-events-none z-[1]" />

      <header className="shrink-0 relative z-10">
        <div className="h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent shadow-[0_0_8px_rgba(59,130,246,0.2)]" />
        <div className="flex items-center justify-between px-8 py-2.5 bg-[#0a0e1a]/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-[2px] h-6 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
              <h1 className="text-sm font-mono text-blue-400 font-bold tracking-[0.15em] drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]">
                XENA
              </h1>
            </div>
            <span className="text-[9px] font-mono text-blue-500/40 tracking-[0.2em] uppercase border-l border-blue-500/20 pl-4">
              neural interface v2
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[9px] font-mono text-blue-500/40 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.6)] animate-pulse" />
              system online
            </span>
            <TimePanel />
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </header>

      <main className="flex-1 flex relative z-10 min-h-0 p-4 gap-4">
        {/* Left: Chat */}
        <div className="w-72 shrink-0 flex flex-col justify-center">
          <ChatPanel />
        </div>

        {/* Center: Orb */}
        <div className="flex-1 flex items-center justify-center min-w-0">
          <CenterZone />
        </div>

        {/* Right: Status + Tools */}
        <div className="w-72 shrink-0 flex flex-col justify-center gap-3">
          <SystemStatus />
          <ToolStatusPanel latestActions={toolActions} />
        </div>
      </main>

      <BottomDock />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <JarvisProvider>
      <DashboardContent />
    </JarvisProvider>
  )
}
