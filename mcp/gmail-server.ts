import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

import { getConfig, setConfig } from '@/lib/utils/config'
import { logger } from '@/lib/utils/logger'

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify']
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'

export interface GmailEmail {
  id: string
  threadId: string
  from: string
  subject: string
  snippet: string
  date: string
  isUnread: boolean
}

type OAuthTokenResponse = {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  token_type: string
}

export class GmailServer {
  private configured: boolean = false

  constructor() {
    this.refreshConfig()
  }

  private refreshConfig(): void {
    const envId = process.env.GMAIL_CLIENT_ID
    const envSecret = process.env.GMAIL_CLIENT_SECRET
    const dbId = getConfig('gmail_client_id')
    const dbSecret = getConfig('gmail_client_secret')

    const clientId = envId && envId !== 'your_google_client_id' ? envId : dbId
    const clientSecret = envSecret && envSecret !== 'your_google_client_secret' ? envSecret : dbSecret

    this.configured = !!(clientId && clientSecret)
  }

  isConfigured(): boolean {
    this.refreshConfig()
    return this.configured
  }

  isLoggedIn(): boolean {
    return getConfig('gmail_logged_in') === 'true'
  }

  getAuthUrl(): string {
    const clientId = process.env.GMAIL_CLIENT_ID || getConfig('gmail_client_id')
    const redirectUri = process.env.GMAIL_REDIRECT_URI
    if (!clientId || !redirectUri) throw new Error('Gmail is not configured')

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    })
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  async handleCallback(code: string): Promise<void> {
    const clientId = process.env.GMAIL_CLIENT_ID || getConfig('gmail_client_id')
    const clientSecret = process.env.GMAIL_CLIENT_SECRET || getConfig('gmail_client_secret')
    const redirectUri = process.env.GMAIL_REDIRECT_URI
    if (!clientId || !clientSecret || !redirectUri) throw new Error('Gmail is not configured')

    const res = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Token exchange failed: ${err}`)
    }

    const tokens: OAuthTokenResponse = await res.json()
    setConfig('gmail_logged_in', 'true')
    if (tokens.refresh_token) setConfig('gmail_refresh_token', tokens.refresh_token)
    setConfig('gmail_access_token', tokens.access_token)
    setConfig('gmail_token_expiry', String(Date.now() + tokens.expires_in * 1000))
    logger.info('gmail', 'Gmail OAuth callback successful')
  }

  async disconnect(): Promise<void> {
    setConfig('gmail_logged_in', 'false')
    setConfig('gmail_refresh_token', '')
    setConfig('gmail_access_token', '')
    setConfig('gmail_token_expiry', '')
    logger.info('gmail', 'Gmail disconnected')
  }

  private async getValidAccessToken(): Promise<string> {
    const accessToken = getConfig('gmail_access_token')
    const refreshToken = getConfig('gmail_refresh_token')
    const expiry = getConfig('gmail_token_expiry')

    if (accessToken && expiry && Date.now() < parseInt(expiry) - 60000) {
      return accessToken
    }

    if (!refreshToken) throw new Error('No refresh token available. Re-authenticate.')

    const clientId = process.env.GMAIL_CLIENT_ID || getConfig('gmail_client_id')
    const clientSecret = process.env.GMAIL_CLIENT_SECRET || getConfig('gmail_client_secret')
    if (!clientId || !clientSecret) throw new Error('Gmail is not configured')

    const res = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
      }).toString(),
    })

    if (!res.ok) {
      setConfig('gmail_logged_in', 'false')
      throw new Error('Token refresh failed. Re-authenticate.')
    }

    const tokens: OAuthTokenResponse = await res.json()
    setConfig('gmail_access_token', tokens.access_token)
    setConfig('gmail_token_expiry', String(Date.now() + tokens.expires_in * 1000))
    return tokens.access_token
  }

  private async callGmailApi(method: string, params: Record<string, unknown>): Promise<any> {
    const token = await this.getValidAccessToken()

    const serverPath = process.cwd() + '/node_modules/gmail-mcp/dist/main.js'

    const transport = new StdioClientTransport({
      command: 'node',
      args: [serverPath],
      env: {
        ...process.env,
        GOOGLE_ACCESS_TOKEN: token,
        MCP_TRANSPORT: 'stdio',
      },
    })

    const client = new Client({ name: 'jarvis-gmail-client', version: '1.0.0' })

    try {
      await client.connect(transport)

      const result = await client.callTool({
        name: method,
        arguments: params,
      })

      return result
    } finally {
      await client.close()
    }
  }

  async getUnreadEmailCount(): Promise<{ count: number }> {
    logger.info('gmail', 'GmailServer.getUnreadEmailCount')
    try {
      const result = await this.callGmailApi('messages_list', { q: 'is:unread', maxResults: 500 })
      const data = this.parseToolResult(result)
      return { count: data.resultSizeEstimate ?? data.messages?.length ?? 0 }
    } catch (error) {
      logger.error('gmail', 'getUnreadEmailCount failed', { error: String(error) })
      throw error
    }
  }

  async getTodayEmailCount(): Promise<{ count: number }> {
    logger.info('gmail', 'GmailServer.getTodayEmailCount')
    try {
      const today = new Date()
      const dateStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`
      const result = await this.callGmailApi('messages_list', { q: `after:${dateStr}`, maxResults: 500 })
      const data = this.parseToolResult(result)
      return { count: data.resultSizeEstimate ?? data.messages?.length ?? 0 }
    } catch (error) {
      logger.error('gmail', 'getTodayEmailCount failed', { error: String(error) })
      throw error
    }
  }

  async getLatestEmails(limit: number = 5): Promise<{ emails: GmailEmail[] }> {
    logger.info('gmail', 'GmailServer.getLatestEmails', { limit })
    try {
      const listResult = await this.callGmailApi('messages_list', { maxResults: Math.min(limit, 50) })
      const listData = this.parseToolResult(listResult)
      const messages: Array<{ id: string; threadId: string }> = listData.messages ?? []

      if (messages.length === 0) return { emails: [] }

      const emails: GmailEmail[] = []
      for (const msgRef of messages.slice(0, limit)) {
        const msgResult = await this.callGmailApi('message_get', { id: msgRef.id })
        const msgData = this.parseToolResult(msgResult)

        const headers = msgData.payload?.headers ?? []
        const getHeader = (name: string) => {
          const h = headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())
          return h?.value ?? ''
        }

        emails.push({
          id: msgData.id ?? '',
          threadId: msgData.threadId ?? '',
          from: getHeader('From'),
          subject: getHeader('Subject'),
          snippet: msgData.snippet ?? '',
          date: getHeader('Date'),
          isUnread: (msgData.labelIds ?? []).includes('UNREAD'),
        })
      }

      return { emails }
    } catch (error) {
      logger.error('gmail', 'getLatestEmails failed', { error: String(error) })
      throw error
    }
  }

  async searchEmails(query: string): Promise<{ emails: GmailEmail[]; query: string }> {
    logger.info('gmail', 'GmailServer.searchEmails', { query })
    try {
      const listResult = await this.callGmailApi('messages_list', { q: query, maxResults: 20 })
      const listData = this.parseToolResult(listResult)
      const messages: Array<{ id: string; threadId: string }> = listData.messages ?? []

      if (messages.length === 0) return { emails: [], query }

      const emails: GmailEmail[] = []
      for (const msgRef of messages) {
        const msgResult = await this.callGmailApi('message_get', { id: msgRef.id })
        const msgData = this.parseToolResult(msgResult)

        const headers = msgData.payload?.headers ?? []
        const getHeader = (name: string) => {
          const h = headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())
          return h?.value ?? ''
        }

        emails.push({
          id: msgData.id ?? '',
          threadId: msgData.threadId ?? '',
          from: getHeader('From'),
          subject: getHeader('Subject'),
          snippet: msgData.snippet ?? '',
          date: getHeader('Date'),
          isUnread: (msgData.labelIds ?? []).includes('UNREAD'),
        })
      }

      return { emails, query }
    } catch (error) {
      logger.error('gmail', 'searchEmails failed', { error: String(error) })
      throw error
    }
  }

  async summarizeTodayEmails(): Promise<{ summary: string }> {
    logger.info('gmail', 'GmailServer.summarizeTodayEmails')
    try {
      const today = new Date()
      const dateStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`
      const q = `after:${dateStr}`

      const listResult = await this.callGmailApi('messages_list', { q, maxResults: 50 })
      const listData = this.parseToolResult(listResult)
      const messages: Array<{ id: string }> = listData.messages ?? []
      const totalCount = listData.resultSizeEstimate ?? messages.length ?? 0

      if (messages.length === 0) return { summary: 'You have not received any emails today.' }

      const unreadResult = await this.callGmailApi('messages_list', { q: `${q} is:unread`, maxResults: 500 })
      const unreadData = this.parseToolResult(unreadResult)
      const unreadCount = unreadData.resultSizeEstimate ?? 0

      const senders = new Set<string>()
      const subjectLines: string[] = []

      for (const msgRef of messages.slice(0, 10)) {
        const msgResult = await this.callGmailApi('message_get', { id: msgRef.id })
        const msgData = this.parseToolResult(msgResult)

        const headers = msgData.payload?.headers ?? []
        const getHeader = (name: string) => {
          const h = headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())
          return h?.value ?? ''
        }

        const from = getHeader('From')
        const subject = getHeader('Subject')
        if (from) senders.add(from)
        if (subject) subjectLines.push(subject)
      }

      const senderList = Array.from(senders).slice(0, 5)

      let summary = `You received ${totalCount} email${totalCount !== 1 ? 's' : ''} today`
      if (unreadCount > 0) {
        summary += `, ${unreadCount} of which ${unreadCount === 1 ? 'is' : 'are'} unread`
      }
      summary += '.'
      if (senderList.length > 0) {
        summary += ` Senders include: ${senderList.join(', ')}.`
      }
      if (subjectLines.length > 0) {
        summary += ` Subjects: ${subjectLines.slice(0, 3).join(' | ')}.`
      }

      return { summary }
    } catch (error) {
      logger.error('gmail', 'summarizeTodayEmails failed', { error: String(error) })
      throw error
    }
  }

  private parseToolResult(result: any): any {
    const content = result.content as Array<{ type: string; text?: string }> | undefined
    if (!content) return {}
    const text = content.find(c => c.type === 'text')?.text
    return text ? JSON.parse(text) : {}
  }
}

export const gmailServer = new GmailServer()
