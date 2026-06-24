'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import GlassCard from '@/components/shared/GlassCard'
import Button from '@/components/shared/Button'

type CameraStatus = 'idle' | 'streaming' | 'captured' | 'error'

export default function CameraPreview() {
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

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setStatus('streaming')
      }
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Camera access denied. Please grant permission.'
          : err instanceof DOMException && err.name === 'NotFoundError'
            ? 'No camera found on this device.'
            : 'Failed to access camera.'
      setErrorMessage(message)
      setStatus('error')
    }
  }, [])

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
    stopStream()
  }, [stopStream])

  const retake = useCallback(() => {
    setCapturedImage(null)
    setStatus('idle')
    startCamera()
  }, [startCamera])

  const reset = useCallback(() => {
    stopStream()
    setCapturedImage(null)
    setStatus('idle')
    setErrorMessage('')
  }, [stopStream])

  useEffect(() => {
    return () => {
      stopStream()
    }
  }, [stopStream])

  return (
    <GlassCard title="Camera Preview">
      <div className="flex flex-col items-center gap-4">
        {/* Preview area */}
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-deep-blue/60 border border-panel-border/40">
          {/* Video stream */}
          {status === 'streaming' && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          {/* Captured image */}
          {status === 'captured' && capturedImage && (
            <img
              src={capturedImage}
              alt="Captured frame"
              className="w-full h-full object-cover"
            />
          )}

          {/* Idle overlay */}
          {status === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-hud-muted/30">
              <span className="text-4xl">◉</span>
              <span className="text-xs font-mono tracking-wider">
                CAMERA STANDBY
              </span>
            </div>
          )}

          {/* Error overlay */}
          {status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <span className="text-3xl text-hud-error">⚠</span>
              <p className="text-xs font-mono text-hud-error/80">{errorMessage}</p>
            </div>
          )}

          {/* Scanning overlay when streaming */}
          {(status === 'streaming' || status === 'captured') && (
            <div className="pointer-events-none absolute inset-0">
              {/* Corner brackets */}
              <div className="absolute top-1 left-1 text-primary-glow/40 text-[8px] font-mono">┌</div>
              <div className="absolute top-1 right-1 text-primary-glow/40 text-[8px] font-mono">┐</div>
              <div className="absolute bottom-1 left-1 text-primary-glow/40 text-[8px] font-mono">└</div>
              <div className="absolute bottom-1 right-1 text-primary-glow/40 text-[8px] font-mono">┘</div>
              {/* Crosshair */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-8 h-px bg-primary-glow/30" />
                <div className="h-8 w-px bg-primary-glow/30 mx-auto mt-[-4px]" />
              </div>
              {/* Scan line */}
              {status === 'streaming' && (
                <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-glow/30 to-transparent animate-[scanLine_2s_linear_infinite]" />
              )}
            </div>
          )}

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {status === 'idle' && (
            <Button onClick={startCamera} size="sm">
              ◉ Start Camera
            </Button>
          )}

          {status === 'streaming' && (
            <>
              <Button onClick={captureFrame} size="sm">
                ◉ Capture Frame
              </Button>
              <Button onClick={reset} variant="ghost" size="sm">
                Stop
              </Button>
            </>
          )}

          {status === 'captured' && (
            <>
              <Button onClick={retake} size="sm">
                ◉ Retake
              </Button>
              <Button onClick={reset} variant="ghost" size="sm">
                Clear
              </Button>
            </>
          )}

          {status === 'error' && (
            <Button onClick={startCamera} size="sm">
              ◉ Retry
            </Button>
          )}
        </div>

        {/* Base64 output */}
        {capturedImage && (
          <div className="w-full">
            <p className="text-[10px] font-mono text-hud-muted/40 tracking-wider mb-1">
              CAPTURED DATA
            </p>
            <div className="w-full max-h-20 overflow-y-auto rounded bg-deep-blue/40 border border-panel-border/30 p-2">
              <code className="text-[9px] font-mono text-hud-muted/50 break-all leading-relaxed">
                {capturedImage.slice(0, 200)}...
              </code>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
