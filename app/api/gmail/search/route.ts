import { NextRequest, NextResponse } from 'next/server'
import { searchEmails } from '@/lib/tools/gmail-tools'
import { logger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    const result = await searchEmails(query)

    return NextResponse.json({
      success: true,
      results: 'emails' in result ? result.emails : [],
      query,
    })
  } catch (error) {
    logger.error('gmail', 'Gmail search API error', { error: String(error) })
    return NextResponse.json(
      { success: false, results: [], error: 'Failed to search emails' },
      { status: 500 }
    )
  }
}
