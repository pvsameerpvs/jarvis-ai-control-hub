import { NextRequest, NextResponse } from 'next/server'
import { analyzeImage } from '@/lib/ai/gemini-client'
import { getDatabase } from '@/lib/db/connection'
import { logger } from '@/lib/utils/logger'

const SYSTEM_INSTRUCTION = `You are XENA, an advanced AI vision system. When given an image, describe what you see naturally and conversationally as if you're a human observer. Be specific about objects, colors, text, people, and the environment. If asked a question, answer it directly and helpfully. Keep responses concise but descriptive. Never say "I can't see" or "I'm an AI" — just describe what's in the image naturally.`

function stripBase64Prefix(data: string): string {
  const comma = data.indexOf(',')
  return comma !== -1 ? data.slice(comma + 1) : data
}

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

    const rawBase64 = stripBase64Prefix(imageBase64)
    const prompt = question || 'Look at this image and describe everything you see in detail.'

    const startTime = Date.now()
    const response = await analyzeImage(rawBase64, prompt, SYSTEM_INSTRUCTION)
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
      data: { durationMs, imageSize: rawBase64.length },
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
