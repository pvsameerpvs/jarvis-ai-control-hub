import { NextRequest, NextResponse } from 'next/server'
import { getLatestEmails } from '@/lib/tools/gmail-tools'
import { logger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 5, 1), 50) : 10

    const result = await getLatestEmails(limit)

    if (!('emails' in result)) {
      return NextResponse.json({
        success: true,
        emails: [],
        message: result.message,
      })
    }

    const emails = (result.emails as Array<{ id?: string; from?: string; subject?: string; date?: string; snippet?: string }>).map(
      (email) => ({
        id: email.id || '',
        from: email.from || '',
        subject: email.subject || '',
        date: email.date || '',
        snippet: email.snippet || '',
      })
    )

    return NextResponse.json({ success: true, emails })
  } catch (error) {
    logger.error('gmail', 'Gmail latest API error', { error: String(error) })
    return NextResponse.json(
      { success: false, emails: [], error: 'Failed to fetch latest emails' },
      { status: 500 }
    )
  }
}
