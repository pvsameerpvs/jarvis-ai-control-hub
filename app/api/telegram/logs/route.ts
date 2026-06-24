import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/connection'
import { logger } from '@/lib/utils/logger'

export async function GET() {
  try {
    const db = getDatabase()
    const rows = db.prepare(
      'SELECT id, action, chat_id, message, direction, status, metadata, created_at FROM telegram_logs ORDER BY created_at DESC LIMIT 100'
    ).all() as Array<{
      id: number
      action: string
      chat_id: string | null
      message: string | null
      direction: string
      status: string
      metadata: string | null
      created_at: string
    }>

    const logs = rows.map((row) => ({
      id: row.id,
      action: row.action,
      chatId: row.chat_id,
      message: row.message,
      direction: row.direction,
      status: row.status,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      createdAt: row.created_at,
    }))

    return NextResponse.json({ success: true, logs })
  } catch (error) {
    logger.error('telegram', 'Telegram logs API error', { error: String(error) })
    return NextResponse.json(
      { success: false, logs: [], error: 'Failed to fetch telegram logs' },
      { status: 500 }
    )
  }
}
