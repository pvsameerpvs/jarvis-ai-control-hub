import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/connection'
import { logger } from '@/lib/utils/logger'

const TABLE_MAP: Record<string, string> = {
  command: 'command_logs',
  ai: 'ai_action_logs',
  connector: 'connector_logs',
  vision: 'vision_logs',
  gmail: 'gmail_logs',
  telegram: 'telegram_logs',
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'command'
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 50, 1), 200) : 50

    const tableName = TABLE_MAP[type]

    if (!tableName) {
      return NextResponse.json(
        { success: false, error: `Invalid log type. Must be one of: ${Object.keys(TABLE_MAP).join(', ')}` },
        { status: 400 }
      )
    }

    const db = getDatabase()
    const rows = db.prepare(
      `SELECT * FROM ${tableName} ORDER BY created_at DESC LIMIT ?`
    ).all(limit) as Array<Record<string, unknown>>

    const logs = rows.map((row) => {
      const log: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(row)) {
        if (key === 'metadata' && typeof value === 'string') {
          try {
            log[key] = JSON.parse(value)
          } catch {
            log[key] = value
          }
        } else {
          log[key] = value
        }
      }
      return log
    })

    return NextResponse.json({ success: true, logs })
  } catch (error) {
    logger.error('system', 'Logs API error', { error: String(error) })
    return NextResponse.json(
      { success: false, logs: [], error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}
