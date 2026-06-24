'use client'

import { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'

type CameraStatus = 'idle' | 'streaming' | 'captured' | 'error'

export interface CameraPreviewHandle {
  startCamera: () => Promise<void>
  captureFrame: () => void
  retake: () => void
  reset: () => void
  status: CameraStatus
  capturedImage: string | null
}

interface CameraPreviewProps {
  onCapture?: (base64: string) => void
  onClear?: () => void
  onStatusChange?: (status: CameraStatus) => void
}

const CameraPreview = forwardRef<CameraPreviewHandle, CameraPreviewProps>(
  function CameraPreview({ onCapture, onClear, onStatusChange }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const [status, setStatus] = useState<CameraStatus>('idle')
    const [capturedImage, setCapturedImage] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState('')

    const stopStream = useCallback(() => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }, [])

    const startCamera = useCallback(async () => {
      setErrorMessage('')
      setCapturedImage(null)
      onClear?.()

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
        })

        streamRef.current = stream

        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          await video.play()
        }
        setStatus('streaming')
        onStatusChange?.('streaming')
      } catch (err) {
        const message =
          err instanceof DOMException && err.name === 'NotAllowedError'
            ? 'Camera access denied.'
            : err instanceof DOMException && err.name === 'NotFoundError'
              ? 'No camera found on this device.'
              : 'Failed to access camera.'
        setErrorMessage(message)
        setStatus('error')
        onStatusChange?.('error')
      }
    }, [onClear, onStatusChange])

    const captureFrame = useCallback(() => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(video, 0, 0)
      const base64 = canvas.toDataURL('image/jpeg', 0.85)
      setCapturedImage(base64)
      setStatus('captured')
      onStatusChange?.('captured')
      onCapture?.(base64)
      stopStream()
    }, [stopStream, onCapture, onStatusChange])

    const retake = useCallback(() => {
      setCapturedImage(null)
      onClear?.()
      setStatus('idle')
      onStatusChange?.('idle')
      startCamera()
    }, [startCamera, onClear, onStatusChange])

    const reset = useCallback(() => {
      stopStream()
      setCapturedImage(null)
      onClear?.()
      setStatus('idle')
      onStatusChange?.('idle')
      setErrorMessage('')
    }, [stopStream, onClear, onStatusChange])

    useImperativeHandle(ref, () => ({
      startCamera,
      captureFrame,
      retake,
      reset,
      status,
      capturedImage,
    }), [startCamera, captureFrame, retake, reset, status, capturedImage])

    useEffect(() => {
      return () => { stopStream() }
    }, [stopStream])

    const isActive = status === 'streaming' || status === 'captured'

    return (
      <div className="fixed inset-0 z-0">
        {/* === VIDEO / IMAGE BACKGROUND === */}
        {/* Video always mounted so ref stays valid */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${status === 'streaming' ? '' : 'hidden'}`}
        />
        {status === 'captured' && capturedImage && (
          <img
            src={capturedImage}
            alt="captured"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Dark overlay over video for readability */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/60 via-[#020617]/30 to-[#020617]/60" />
        )}

        {/* Idle state */}
        {status === 'idle' && (
          <div className="absolute inset-0 bg-background flex flex-col items-center justify-center z-[1]">
            <div className="bg-grid-pattern absolute inset-0 opacity-30" />
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-2 border-primary-glow/20 flex items-center justify-center
                shadow-[0_0_60px_rgba(0,229,255,0.05),inset_0_0_60px_rgba(0,229,255,0.03)]">
                <span className="text-5xl text-primary-glow/30">◉</span>
              </div>
              <div className="absolute inset-0 rounded-full border border-primary-glow/10 animate-[corePulse_3s_ease-in-out_infinite]" />
              <div className="absolute -inset-4 rounded-full border border-primary-glow/[0.05] animate-[rotateRing_6s_linear_infinite]" />
              <div className="absolute -inset-8 rounded-full border border-primary-glow/[0.03] border-dashed animate-[rotateRing_10s_linear_infinite_reverse]" />
            </div>
            <div className="text-center mt-8">
              <p className="text-sm font-mono text-primary-glow/40 tracking-[0.25em]">VISION SYSTEM STANDBY</p>
              <p className="text-[11px] font-mono text-hud-muted/20 mt-3 tracking-wider">awaiting activation</p>
            </div>
            <div className="mt-12 flex gap-2">
              <span className="text-[10px] font-mono text-primary-glow/20 tracking-[0.3em]">◆</span>
              <span className="text-[10px] font-mono text-primary-glow/20 tracking-[0.2em]">SYSTEM OFFLINE</span>
              <span className="text-[10px] font-mono text-primary-glow/20 tracking-[0.3em]">◆</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className="absolute inset-0 bg-background flex flex-col items-center justify-center gap-4 z-[1]">
            <span className="text-4xl text-hud-error">⚠</span>
            <p className="text-sm font-mono text-hud-error/80">{errorMessage}</p>
          </div>
        )}

        {/* === FULL-SCREEN CORNER BRACKETS === */}
        <div className="absolute top-4 left-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M22 2H2V22" stroke="rgba(0,229,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="absolute top-4 right-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="rotate-90">
            <path d="M22 2H2V22" stroke="rgba(0,229,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="absolute bottom-4 left-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="rotate-270">
            <path d="M22 2H2V22" stroke="rgba(0,229,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="absolute bottom-4 right-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="rotate-180">
            <path d="M22 2H2V22" stroke="rgba(0,229,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* === SCANNER CIRCLE - CENTER === */}
        {isActive && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] pointer-events-none">
            {/* Outer glow */}
            <div className="absolute inset-0 rounded-full bg-primary-glow/[0.04] blur-[80px]" />

            {/* Ethereal ring glow */}
            <div className="absolute inset-[-20px] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.06)_0%,transparent_70%)]" />

            {/* Radar arc - rotating */}
            <div className="absolute inset-0 rounded-full animate-[rotateRing_4s_linear_infinite]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-1/2 bg-gradient-to-t from-transparent via-primary-glow/50 to-primary-glow/80 rounded-full origin-bottom" />
            </div>
            <div className="absolute inset-0 rounded-full animate-[rotateRing_4s_linear_infinite_1s]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-[40%] bg-gradient-to-t from-transparent via-primary-glow/20 to-primary-glow/40 rounded-full origin-bottom" />
            </div>

            {/* Ring 1 - outer solid */}
            <div className="absolute inset-0 rounded-full border border-primary-glow/20 shadow-[0_0_30px_rgba(0,229,255,0.06),inset_0_0_30px_rgba(0,229,255,0.03)]" />

            {/* Ring 2 - middle dashed */}
            <div className="absolute inset-[35px] rounded-full border border-primary-glow/15 border-dashed" />

            {/* Ring 3 - inner thin */}
            <div className="absolute inset-[70px] rounded-full border border-primary-glow/10" />

            {/* Ring 4 - innermost subtle */}
            <div className="absolute inset-[100px] rounded-full border border-primary-glow/[0.06]" />

            {/* Center targeting reticle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative w-16 h-16">
                {/* Crosshair lines */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-glow/60 to-transparent shadow-[0_0_8px_rgba(0,229,255,0.3)]" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary-glow/60 to-transparent shadow-[0_0_8px_rgba(0,229,255,0.3)]" />
                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[3px] h-[3px] rounded-full bg-primary-glow/80 shadow-[0_0_12px_rgba(0,229,255,0.7)]" />
                {/* Reticle ring */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-primary-glow/25" />
                {/* Tick marks */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-2 bg-primary-glow/30" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-2 bg-primary-glow/30" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-px bg-primary-glow/30" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-px bg-primary-glow/30" />
              </div>
            </div>

            {/* Moving scan line */}
            {status === 'streaming' && (
              <div className="absolute left-[20px] right-[20px] h-[2px] bg-gradient-to-r from-transparent via-primary-glow/50 to-transparent shadow-[0_0_10px_rgba(0,229,255,0.3)] animate-[scanLine_2.5s_linear_infinite]" />
            )}

            {/* Corner bracket indicators on scanner */}
            <div className="absolute top-2 left-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M12 2H2V12" stroke="rgba(0,229,255,0.3)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="absolute top-2 right-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="rotate-90">
                <path d="M12 2H2V12" stroke="rgba(0,229,255,0.3)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="absolute bottom-2 left-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="rotate-270">
                <path d="M12 2H2V12" stroke="rgba(0,229,255,0.3)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="absolute bottom-2 right-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="rotate-180">
                <path d="M12 2H2V12" stroke="rgba(0,229,255,0.3)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        )}

        {/* === TOP-LEFT HUD DATA === */}
        {isActive && (
          <div className="absolute top-16 left-6 pointer-events-none">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-glow shadow-[0_0_8px_rgba(0,229,255,0.7)] animate-pulse" />
              <span className="text-[10px] font-mono text-primary-glow/70 tracking-[0.15em]">SYS::SCANNING</span>
            </div>
            <p className="text-[9px] font-mono text-primary-glow/40 tracking-wider">MODE: {status === 'captured' ? 'FRAME_LOCKED' : 'LIVE_FEED'}</p>
            <p className="text-[9px] font-mono text-primary-glow/30 tracking-wider mt-0.5">TARGET: ACQUIRED</p>
          </div>
        )}

        {/* === TOP-RIGHT HUD DATA === */}
        {isActive && (
          <div className="absolute top-16 right-6 text-right pointer-events-none">
            <p className="text-[10px] font-mono text-primary-glow/60 tracking-[0.15em]">
              {status === 'captured' ? 'FRAME CAPTURED' : 'LIVE SCAN'}
            </p>
            <p className="text-[9px] font-mono text-primary-glow/30 tracking-wider mt-0.5">RES: 640×480</p>
          </div>
        )}

        {/* === Hidden canvas === */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    )
  }
)

export default CameraPreview
