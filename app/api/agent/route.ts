import { NextRequest, NextResponse } from 'next/server'
import { processCommand } from '@/lib/ai/agent'
import { getDatabase } from '@/lib/db/connection'
import { logger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { command, language } = body

    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Command is required and must be a string' },
        { status: 400 }
      )
    }

    const result = await processCommand(command, language || 'en-US')

    try {
      const db = getDatabase()
      db.prepare(
        'INSERT INTO command_logs (type, message, metadata) VALUES (?, ?, ?)'
      ).run('api', command, JSON.stringify({ source: 'api/agent', result: result.success, language }))
    } catch (dbError) {
      logger.error('system', 'Failed to log command to database', { error: String(dbError) })
    }

    return NextResponse.json({
      success: result.success,
      command: result.command,
      tool: result.tool,
      response: result.response,
      data: result.data,
      requiresConfirmation: result.requiresConfirmation,
    })
  } catch (error) {
    logger.error('system', 'Agent API error', { error: String(error) })
    return NextResponse.json(
      { success: false, error: 'Failed to process command' },
      { status: 500 }
    )
  }
}
