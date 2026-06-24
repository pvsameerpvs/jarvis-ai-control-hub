import { NextRequest, NextResponse } from 'next/server'
import { analyzeImage } from '@/lib/ai/gemini-client'
import { getDatabase } from '@/lib/db/connection'
import { logger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageBase64, question } = body

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        { success: false, error: 'imageBase64 is required and must be a string' },
        { status: 400 }
      )
    }

    const prompt = question || 'Analyze this image and describe what you see in detail.'

    const startTime = Date.now()
    const response = await analyzeImage(imageBase64, prompt)
    const durationMs = Date.now() - startTime

    try {
      const db = getDatabase()
      db.prepare(
        `INSERT INTO vision_logs (source, action, image_description, analysis_result, duration_ms, status)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run('api/camera', 'analyze', prompt.substring(0, 200), response, durationMs, 'success')
    } catch (dbError) {
      logger.error('system', 'Failed to log vision analysis', { error: String(dbError) })
    }

    return NextResponse.json({
      success: true,
      response,
      data: { durationMs, imageSize: imageBase64.length },
    })
  } catch (error) {
    const errorMessage = String(error)
    logger.error('vision', 'Camera analyze API error', { error: errorMessage })

    try {
      const db = getDatabase()
      db.prepare(
        `INSERT INTO vision_logs (source, action, image_description, analysis_result, duration_ms, status, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run('api/camera', 'analyze', null, null, null, 'error', JSON.stringify({ error: errorMessage }))
    } catch {
    }

    return NextResponse.json(
      { success: false, error: 'Image analysis failed' },
      { status: 500 }
    )
  }
}
