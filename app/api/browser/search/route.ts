import { NextRequest, NextResponse } from 'next/server'
import { openGoogleSearch, openYouTubeSearch, openWebsite } from '@/lib/tools/browser-tools'
import { logger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, query, url } = body

    if (!type || !['google', 'youtube', 'website'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type must be one of: google, youtube, website' },
        { status: 400 }
      )
    }

    if (type === 'website' && !url) {
      return NextResponse.json(
        { success: false, error: 'URL is required for website type' },
        { status: 400 }
      )
    }

    if ((type === 'google' || type === 'youtube') && !query) {
      return NextResponse.json(
        { success: false, error: 'Query is required for search type' },
        { status: 400 }
      )
    }

    let result: { success: boolean; url: string; error?: string }

    if (type === 'google') {
      result = await openGoogleSearch(query!)
    } else if (type === 'youtube') {
      result = await openYouTubeSearch(query!)
    } else {
      result = await openWebsite(url!)
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, action: type, message: result.error || 'Browser action failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      action: type,
      message: `${type === 'google' ? 'Google search' : type === 'youtube' ? 'YouTube search' : 'Website'} opened in browser`,
      url: result.url,
    })
  } catch (error) {
    logger.error('system', 'Browser search API error', { error: String(error) })
    return NextResponse.json(
      { success: false, error: 'Browser action failed' },
      { status: 500 }
    )
  }
}
