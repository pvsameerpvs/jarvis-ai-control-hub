import { chatWithGemini, analyzeImage } from '@/lib/ai/gemini-client'
import { buildToolsDeclaration } from '@/lib/ai/function-schemas'
import { executeTool } from '@/lib/ai/tool-runner'
import { getSystemPrompt } from '@/lib/ai/prompts'
import { getDatabase } from '@/lib/db/connection'
import { logger } from '@/lib/utils/logger'

export interface AgentResponse {
  success: boolean
  command: string
  tool?: string
  response: string
  data?: unknown
  requiresConfirmation?: boolean
  confirmationMessage?: string
}

interface ConversationMessage {
  role: string
  parts: {
    text?: string
    functionCall?: { name: string; args: Record<string, unknown> }
    functionResponse?: { name: string; response: Record<string, unknown> }
  }[]
}

let conversationHistory: ConversationMessage[] = []

export function clearConversationHistory(): void {
  conversationHistory = []
}

function logAiAction(
  action: string,
  prompt: string | null,
  response: string | null,
  model: string,
  tokensUsed: number | null,
  durationMs: number,
  status: string,
  metadata?: Record<string, unknown>
): void {
  try {
    const db = getDatabase()
    const stmt = db.prepare(
      `INSERT INTO ai_action_logs (action, prompt, response, model, tokens_used, duration_ms, status, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    stmt.run(
      action,
      prompt,
      response,
      model,
      tokensUsed,
      durationMs,
      status,
      metadata ? JSON.stringify(metadata) : null
    )
  } catch (error) {
    console.error('Failed to log AI action:', error)
  }
}

function logCommand(message: string, metadata?: Record<string, unknown>): void {
  try {
    const db = getDatabase()
    const stmt = db.prepare(
      'INSERT INTO command_logs (type, message, metadata) VALUES (?, ?, ?)'
    )
    stmt.run('command', message, metadata ? JSON.stringify(metadata) : null)
  } catch (error) {
    console.error('Failed to log command:', error)
  }
}

export async function processCommand(command: string): Promise<AgentResponse> {
  const startTime = Date.now()
  logger.command(`Processing command: ${command}`)

  logCommand(command, { source: 'agent' })

  try {
    const tools = buildToolsDeclaration()
    const systemPrompt = getSystemPrompt()

    const historyMessages = conversationHistory.map(msg => ({
      role: msg.role,
      parts: msg.parts.map(p => ({
        ...(p.text ? { text: p.text } : {}),
        ...(p.functionCall ? { functionCall: p.functionCall } : {}),
        ...(p.functionResponse ? { functionResponse: p.functionResponse } : {}),
      })),
    }))

    const result = await chatWithGemini(command, tools, systemPrompt)

    if (result.functionCalls && result.functionCalls.length > 0) {
      const fc = result.functionCalls[0]
      const toolName = fc.name
      const toolArgs = fc.args

      conversationHistory.push({
        role: 'user',
        parts: [{ text: command }],
      })

      conversationHistory.push({
        role: 'model',
        parts: [{ functionCall: { name: toolName, args: toolArgs } }],
      })

      const toolResult = await executeTool(toolName, toolArgs)

      if (toolResult.requiresConfirmation) {
        const duration = Date.now() - startTime
        logAiAction(
          'tool_requires_confirmation',
          command,
          null,
          'gemini-2.5-flash',
          null,
          duration,
          'pending_confirmation',
          { tool: toolName, args: toolArgs }
        )

        return {
          success: true,
          command,
          tool: toolName,
          response: toolResult.confirmationMessage || 'This action requires your confirmation.',
          data: null,
          requiresConfirmation: true,
          confirmationMessage: toolResult.confirmationMessage,
        }
      }

      conversationHistory.push({
        role: 'user',
        parts: [{
          functionResponse: {
            name: toolName,
            response: { output: toolResult.data },
          },
        }],
      })

      const followUp = await chatWithGemini(
        'Continue based on the tool result.',
        tools,
        systemPrompt
      )

      const finalResponse = followUp.text || `Executed ${toolName}.`
      const duration = Date.now() - startTime

      logAiAction(
        `tool:${toolName}`,
        command,
        finalResponse,
        'gemini-2.5-flash',
        null,
        duration,
        toolResult.success ? 'success' : 'error',
        { tool: toolName, args: toolArgs, toolData: toolResult.data }
      )

      conversationHistory.push({
        role: 'model',
        parts: [{ text: finalResponse }],
      })

      if (conversationHistory.length > 50) {
        conversationHistory = conversationHistory.slice(-50)
      }

      return {
        success: toolResult.success,
        command,
        tool: toolName,
        response: finalResponse,
        data: toolResult.data,
      }
    }

    const responseText = result.text || 'I understand your request. How can I assist further?'
    const duration = Date.now() - startTime

    logAiAction(
      'chat',
      command,
      responseText,
      'gemini-2.5-flash',
      null,
      duration,
      'success'
    )

    conversationHistory.push({
      role: 'user',
      parts: [{ text: command }],
    })
    conversationHistory.push({
      role: 'model',
      parts: [{ text: responseText }],
    })

    if (conversationHistory.length > 50) {
      conversationHistory = conversationHistory.slice(-50)
    }

    return {
      success: true,
      command,
      response: responseText,
    }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = String(error)

    logger.error('ai', `Agent error: ${errorMessage}`)

    logAiAction(
      'error',
      command,
      errorMessage,
      'gemini-2.5-flash',
      null,
      duration,
      'error'
    )

    return {
      success: false,
      command,
      response: `I encountered an error: ${errorMessage}`,
      data: null,
    }
  }
}

export async function analyzeCameraImage(
  imageBase64: string,
  question: string
): Promise<string> {
  const startTime = Date.now()

  try {
    const systemPrompt = getSystemPrompt()
    const result = await analyzeImage(imageBase64, question, systemPrompt)

    logAiAction(
      'vision:analyze',
      question,
      result,
      'gemini-2.5-flash',
      null,
      Date.now() - startTime,
      'success',
      { imageSize: imageBase64.length }
    )

    return result
  } catch (error) {
    logger.error('vision', 'Agent vision error', { error: String(error) })
    throw error
  }
}

export function getConversationHistory(): ConversationMessage[] {
  return conversationHistory
}
