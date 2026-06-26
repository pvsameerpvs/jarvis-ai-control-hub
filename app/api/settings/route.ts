import { NextRequest, NextResponse } from 'next/server'
import { getAllConfig, setConfig, invalidateConfigCache } from '@/lib/utils/config'
import { logger } from '@/lib/utils/logger'

export async function GET() {
  try {
    const settings = getAllConfig()
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    logger.error('system', 'Settings GET API error', { error: String(error) })
    return NextResponse.json(
      { success: false, settings: {}, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const keys = Object.keys(body)
    if (keys.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one setting key-value pair is required' },
        { status: 400 }
      )
    }
    for (const [key, value] of Object.entries(body)) {
      setConfig(key, String(value))
    }
    invalidateConfigCache()
    const settings = getAllConfig()
    return NextResponse.json({
      success: true,
      settings,
      message: `${keys.length} setting(s) updated successfully`,
    })
  } catch (error) {
    logger.error('system', 'Settings POST API error', { error: String(error) })
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value } = body

    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Key is required and must be a string' },
        { status: 400 }
      )
    }

    if (value === undefined || value === null) {
      return NextResponse.json(
        { success: false, error: 'Value is required' },
        { status: 400 }
      )
    }

    setConfig(key, String(value))
    invalidateConfigCache()

    const settings = getAllConfig()

    return NextResponse.json({
      success: true,
      settings,
      message: `Setting "${key}" updated successfully`,
    })
  } catch (error) {
    logger.error('system', 'Settings PUT API error', { error: String(error) })
    return NextResponse.json(
      { success: false, error: 'Failed to update setting' },
      { status: 500 }
    )
  }
}
