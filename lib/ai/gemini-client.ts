import { GoogleGenAI, Type } from '@google/genai'
import { logger } from '@/lib/utils/logger'

const apiKey = process.env.GEMINI_API_KEY || ''

let ai: GoogleGenAI | null = null

function getClient(): GoogleGenAI {
  if (!ai) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set')
    }
    ai = new GoogleGenAI({ apiKey })
  }
  return ai
}

export async function chatWithGemini(
  command: string,
  tools?: { functionDeclarations: { name: string; description: string; parameters?: Record<string, unknown> }[] }[],
  systemInstruction?: string
): Promise<{ text?: string; functionCalls?: { name: string; args: Record<string, unknown> }[] }> {
  const client = getClient()
  const startTime = Date.now()

  try {
    const config: Record<string, unknown> = {}
    if (tools && tools.length > 0) {
      config.tools = tools
    }
    if (systemInstruction) {
      config.systemInstruction = systemInstruction
    }

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: command,
      config: config as any,
    })

    const duration = Date.now() - startTime
    const text = response.text
    const functionCalls = response.functionCalls?.map(fc => ({
      name: fc.name || '',
      args: (fc.args as Record<string, unknown>) || {},
    }))

    logger.ai('Gemini response received', {
      hasText: !!text,
      functionCallsCount: functionCalls?.length || 0,
      durationMs: duration,
    })

    return { text, functionCalls }
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('ai', 'Gemini API call failed', {
      error: String(error),
      durationMs: duration,
    })
    throw error
  }
}

export async function analyzeImage(
  imageBase64: string,
  question: string,
  systemInstruction?: string
): Promise<string> {
  const client = getClient()
  const startTime = Date.now()

  try {
    const config: Record<string, unknown> = {}
    if (systemInstruction) {
      config.systemInstruction = systemInstruction
    }

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { text: question },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64,
          },
        },
      ],
      config: config as any,
    })

    const duration = Date.now() - startTime
    const result = response.text || ''

    logger.vision('Image analyzed', {
      questionLength: question.length,
      durationMs: duration,
      responseLength: result.length,
    })

    return result
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('vision', 'Image analysis failed', {
      error: String(error),
      durationMs: duration,
    })
    throw error
  }
}

export async function chatWithHistory(
  history: { role: string; parts: { text?: string; functionCall?: { name: string; args: Record<string, unknown> }; functionResponse?: { name: string; response: Record<string, unknown> } }[] }[],
  tools?: { functionDeclarations: { name: string; description: string; parameters?: Record<string, unknown> }[] }[],
  systemInstruction?: string
): Promise<{ text?: string; functionCalls?: { name: string; args: Record<string, unknown> }[] }> {
  const client = getClient()
  const startTime = Date.now()

  try {
    const config: Record<string, unknown> = {}
    if (tools && tools.length > 0) {
      config.tools = tools
    }
    if (systemInstruction) {
      config.systemInstruction = systemInstruction
    }

    const safeHistory = history.map(msg => ({
      role: msg.role,
      parts: msg.parts.map(p => ({
        ...(p.text ? { text: p.text } : {}),
        ...(p.functionCall ? {
          functionCall: { name: p.functionCall.name, args: p.functionCall.args }
        } : {}),
        ...(p.functionResponse ? {
          functionResponse: { name: p.functionResponse.name, response: p.functionResponse.response }
        } : {}),
      })),
    }))

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: safeHistory as any,
      config: config as any,
    })

    const duration = Date.now() - startTime
    const text = response.text
    const functionCalls = response.functionCalls?.map(fc => ({
      name: fc.name || '',
      args: (fc.args as Record<string, unknown>) || {},
    }))

    logger.ai('Gemini history response received', {
      hasText: !!text,
      functionCallsCount: functionCalls?.length || 0,
      durationMs: duration,
      historyLength: history.length,
    })

    return { text, functionCalls }
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('ai', 'Gemini history API call failed', {
      error: String(error),
      durationMs: duration,
    })
    throw error
  }
}

export async function transcribeAudio(
  audioBase64: string,
  mimeType: string = 'audio/webm'
): Promise<string> {
  const client = getClient()
  const startTime = Date.now()

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { text: 'Transcribe the speech in this audio accurately. Return only the transcribed text, nothing else.' },
        {
          inlineData: {
            mimeType,
            data: audioBase64,
          },
        },
      ],
    })

    const duration = Date.now() - startTime
    const result = response.text || ''

    logger.ai('Audio transcribed', {
      durationMs: duration,
      responseLength: result.length,
    })

    return result
  } catch (error) {
    logger.error('ai', 'Audio transcription failed', {
      error: String(error),
      durationMs: Date.now() - startTime,
    })
    throw error
  }
}

export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY
}

export { Type }
