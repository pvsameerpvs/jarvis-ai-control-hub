import { NextResponse } from 'next/server'
import { getTodayEmailCount, getUnreadEmailCount } from '@/lib/tools/gmail-tools'
import { logger } from '@/lib/utils/logger'

export async function GET() {
  try {
    const todayResult = await getTodayEmailCount()
    const unreadResult = await getUnreadEmailCount()

    const todayCount = todayResult && 'count' in todayResult ? todayResult.count : 0
    const unreadCount = unreadResult && 'count' in unreadResult ? unreadResult.count : 0

    return NextResponse.json({
      success: true,
      todayCount,
      unreadCount,
    })
  } catch (error) {
    logger.error('gmail', 'Gmail count API error', { error: String(error) })
    return NextResponse.json(
      { success: false, todayCount: 0, unreadCount: 0, error: 'Failed to fetch email counts' },
      { status: 500 }
    )
  }
}
