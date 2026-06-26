import { analyzeImage } from '@/lib/ai/gemini-client'
import { logger } from '@/lib/utils/logger'

const CAMERA_SYSTEM_PROMPT = `You are XENA vision system. Analyze the image carefully and provide detailed information.
For object explanation: Identify all visible objects, their likely purpose, and any notable characteristics.
For document reading: Extract all text content accurately, maintaining formatting where possible.`

export async function openCamera(): Promise<{ action: string; instruction: string }> {
  logger.vision('openCamera called')
  return {
    action: 'open_camera',
    instruction: 'Frontend should activate the camera stream and display it to the user.',
  }
}

export async function captureCameraFrame(): Promise<{ action: string; instruction: string }> {
  logger.vision('captureCameraFrame called')
  return {
    action: 'capture_frame',
    instruction: 'Frontend should capture a single frame from the active camera stream and return it as base64.',
  }
}

export async function analyzeCameraImage(
  imageBase64: string,
  question: string
): Promise<{ analysis: string }> {
  const startTime = Date.now()
  logger.vision('analyzeCameraImage called', { question: question.substring(0, 100) })

  try {
    const result = await analyzeImage(imageBase64, question, CAMERA_SYSTEM_PROMPT)
    const duration = Date.now() - startTime

    logger.vision('Image analyzed successfully', { durationMs: duration })

    return { analysis: result }
  } catch (error) {
    logger.error('vision', 'Camera image analysis failed', { error: String(error) })
    throw error
  }
}

export async function explainVisibleObject(
  imageBase64: string
): Promise<{ explanation: string }> {
  const startTime = Date.now()
  logger.vision('explainVisibleObject called')

  try {
    const question = 'Identify and explain all visible objects in this image. Describe what they are, their likely purpose, and any notable details.'
    const result = await analyzeImage(imageBase64, question, CAMERA_SYSTEM_PROMPT)
    const duration = Date.now() - startTime

    logger.vision('Objects explained', { durationMs: duration })

    return { explanation: result }
  } catch (error) {
    logger.error('vision', 'Object explanation failed', { error: String(error) })
    throw error
  }
}

export async function readDocumentFromCamera(
  imageBase64: string
): Promise<{ text: string }> {
  const startTime = Date.now()
  logger.vision('readDocumentFromCamera called')

  try {
    const question = 'Extract and read all text from this document image. Provide the full text content accurately.'
    const result = await analyzeImage(imageBase64, question, CAMERA_SYSTEM_PROMPT)
    const duration = Date.now() - startTime

    logger.vision('Document read successfully', {
      durationMs: duration,
      extractedLength: result.length,
    })

    return { text: result }
  } catch (error) {
    logger.error('vision', 'Document reading failed', { error: String(error) })
    throw error
  }
}
