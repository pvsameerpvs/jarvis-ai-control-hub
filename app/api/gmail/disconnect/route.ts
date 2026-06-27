import { NextResponse } from 'next/server'
import { gmailServer } from '@/mcp/gmail-server'
import { setConfig } from '@/lib/utils/config'

export async function POST() {
  try {
    await gmailServer.disconnect()
    setConfig('gmail_integration', 'false')
    return NextResponse.json({ success: true, message: 'Gmail disconnected successfully.' })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
