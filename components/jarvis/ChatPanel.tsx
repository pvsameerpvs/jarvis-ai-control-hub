'use client'

import { useEffect, useRef, useState } from 'react'
import { useJarvis } from './VoiceAssistant'

export default function ChatPanel() {
  const { commandHistory, lastResponse, displayedResponse, isTyping, sendTextMessage } = useJarvis()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [commandHistory, displayedResponse, isTyping])

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    await sendTextMessage(text)
  }

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/15 overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.03)]">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-blue-500/20 bg-blue-950/20">
        <span className="text-blue-400 text-sm font-mono tracking-wider">XENA</span>
        <span className="text-blue-500/40 text-[10px] font-mono">// session</span>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-blue-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.6)] animate-pulse" />
          active
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 font-mono">
        {commandHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-blue-700/30 gap-2">
            <span className="text-2xl animate-pulse">_</span>
            <span className="text-xs tracking-[0.2em]">awaiting input...</span>
          </div>
        )}

        {commandHistory.map((cmd, i) => {
          const isLatest = i === commandHistory.length - 1
          const resp = isLatest ? displayedResponse : ''
          const showCursor = isLatest && isTyping
          return (
            <div key={i} className="space-y-2 group">
              <div className="flex items-start gap-2">
                <span className="text-blue-500/50 text-[10px] mt-0.5 shrink-0">$</span>
                <span className="text-blue-300/90 text-xs break-words">{cmd}</span>
              </div>
              {(resp || showCursor) && (
                <div className="flex items-start gap-2 pl-4 border-l border-blue-500/20">
                  <span className="text-blue-400/50 text-[10px] mt-0.5 shrink-0">▸</span>
                  <span className="text-blue-300/70 text-xs break-words leading-relaxed">
                    {resp}
                    {showCursor && <span className="animate-pulse text-blue-400/70">▊</span>}
                  </span>
                </div>
              )}
            </div>
          )
        })}

        <div className="text-blue-700/30 text-[10px] animate-pulse">▊</div>
      </div>

      <div className="border-t border-blue-500/20 p-3 bg-blue-950/10">
        <div className="flex items-center gap-2">
          <span className="text-blue-500/50 text-xs font-mono">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
            placeholder="type command..."
            className="flex-1 bg-transparent border-none outline-none text-blue-300/90 text-xs font-mono placeholder:text-blue-700/30"
          />
        </div>
      </div>
    </div>
  )
}
