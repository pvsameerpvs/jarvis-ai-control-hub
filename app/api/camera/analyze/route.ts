import { NextRequest, NextResponse } from 'next/server'
import { analyzeImage } from '@/lib/ai/gemini-client'
import { getDatabase } from '@/lib/db/connection'
import { logger } from '@/lib/utils/logger'

const SYSTEM_INSTRUCTION = `You are XENA, a real person looking through a camera. Talk naturally like a human observer. Focus on the MAIN object or subject the user is pointing at — describe it in rich detail (color, shape, texture, brand, material). If the user asks "what is this", identify and describe THAT object specifically, not the background. Never list everything in the room — zoom in on what matters. Speak conversationally and complete your thought in one go. Keep it vivid but natural, as if describing to a friend. Never say "I can't see" or "I'm an AI".`

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
    const prompt = question || 'Look at the image and describe the MAIN object or subject in detail — what is it, what does it look like, what makes it interesting.'

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
