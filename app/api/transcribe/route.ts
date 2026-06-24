import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio } from '@/lib/ai/gemini-client'
import { logger } from '@/lib/utils/logger'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as Blob | null

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer())
    const base64 = buffer.toString('base64')
    const mimeType = audioFile.type || 'audio/webm'

    const text = await transcribeAudio(base64, mimeType)

    logger.info('system', 'Transcription completed', { text: text.slice(0, 100) })

    return NextResponse.json({ text })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error('system', 'Transcription failed', { error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
