import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/connection'
import { logger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!botToken || !chatId) {
      const errorMsg = 'Telegram is not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables.'

      try {
        const db = getDatabase()
        db.prepare(
          'INSERT INTO telegram_logs (action, chat_id, message, direction, status, metadata) VALUES (?, ?, ?, ?, ?, ?)'
        ).run('send', chatId || null, message, 'sent', 'error', JSON.stringify({ error: errorMsg }))
      } catch {
      }

      return NextResponse.json(
        { success: false, status: 'not_configured', message: errorMsg },
        { status: 503 }
      )
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`
    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })

    const data = await apiResponse.json()

    if (!data.ok) {
      throw new Error(data.description || 'Failed to send Telegram message')
    }

    try {
      const db = getDatabase()
      db.prepare(
        'INSERT INTO telegram_logs (action, chat_id, message, direction, status, metadata) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(
        'send',
        chatId,
        message,
        'sent',
        'success',
        JSON.stringify({ messageId: data.result?.message_id })
      )
    } catch (dbError) {
      logger.error('system', 'Failed to log telegram message', { error: String(dbError) })
    }

    return NextResponse.json({
      success: true,
      status: 'sent',
      message: 'Message sent successfully',
    })
  } catch (error) {
    const errorMessage = String(error)
    logger.error('telegram', 'Telegram send API error', { error: errorMessage })

    try {
      const db = getDatabase()
      db.prepare(
        'INSERT INTO telegram_logs (action, chat_id, message, direction, status, metadata) VALUES (?, ?, ?, ?, ?, ?)'
      ).run('send', null, null, 'sent', 'error', JSON.stringify({ error: errorMessage }))
    } catch {
    }

    return NextResponse.json(
      { success: false, status: 'error', message: errorMessage },
      { status: 500 }
    )
  }
}
