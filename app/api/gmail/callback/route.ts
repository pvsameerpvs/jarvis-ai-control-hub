import { NextRequest, NextResponse } from 'next/server'
import { gmailServer } from '@/mcp/gmail-server'
import { setConfig } from '@/lib/utils/config'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(new URL('/settings?gmail=error&reason=' + error, request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/settings?gmail=error&reason=no_code', request.url))
    }

    if (!gmailServer.isConfigured()) {
      return NextResponse.redirect(new URL('/settings?gmail=error&reason=not_configured', request.url))
    }

    await gmailServer.handleCallback(code)
    setConfig('gmail_integration', 'true')

    return NextResponse.redirect(new URL('/settings?gmail=connected', request.url))
  } catch (error) {
    return NextResponse.redirect(
      new URL('/settings?gmail=error&reason=' + encodeURIComponent(String(error)), request.url)
    )
  }
}
