import { NextResponse } from 'next/server'
import { gmailServer } from '@/mcp/gmail-server'

export async function GET() {
  try {
    if (!gmailServer.isConfigured()) {
      return NextResponse.json(
        { error: 'Gmail is not configured. Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in .env' },
        { status: 400 }
      )
    }

    if (gmailServer.isLoggedIn()) {
      return NextResponse.json({ loggedIn: true, message: 'Already logged in to Gmail.' })
    }

    const authUrl = gmailServer.getAuthUrl()
    return NextResponse.json({ authUrl })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
