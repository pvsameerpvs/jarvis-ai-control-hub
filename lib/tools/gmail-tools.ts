import { gmailServer } from '@/mcp/gmail-server'
import { getConfig } from '@/lib/utils/config'
import { logger } from '@/lib/utils/logger'

function isGmailConfigured(): boolean {
  return getConfig('gmail_integration') === 'true' && gmailServer.isConfigured()
}

function gmailNotConfiguredResponse() {
  return {
    configured: false as const,
    message: 'Gmail integration is not configured. Enable it in settings and set GMAIL_CLIENT_ID/GMAIL_CLIENT_SECRET in .env.',
  }
}

function gmailNotLoggedInResponse() {
  return {
    loggedIn: false as const,
    message: 'Gmail is not connected. Please go to Settings > Gmail and click "Connect Gmail" to authenticate.',
  }
}

export async function getTodayEmailCount() {
  logger.info('gmail', 'getTodayEmailCount called')
  if (!isGmailConfigured()) return gmailNotConfiguredResponse()
  if (!gmailServer.isLoggedIn()) return gmailNotLoggedInResponse()
  try {
    return await gmailServer.getTodayEmailCount()
  } catch (error) {
    return { error: true, message: String(error) }
  }
}

export async function getUnreadEmailCount() {
  logger.info('gmail', 'getUnreadEmailCount called')
  if (!isGmailConfigured()) return gmailNotConfiguredResponse()
  if (!gmailServer.isLoggedIn()) return gmailNotLoggedInResponse()
  try {
    return await gmailServer.getUnreadEmailCount()
  } catch (error) {
    return { error: true, message: String(error) }
  }
}

export async function getLatestEmails(limit: number = 5) {
  logger.info('gmail', 'getLatestEmails called', { limit })
  if (!isGmailConfigured()) return gmailNotConfiguredResponse()
  if (!gmailServer.isLoggedIn()) return gmailNotLoggedInResponse()
  try {
    return await gmailServer.getLatestEmails(limit)
  } catch (error) {
    return { error: true, message: String(error) }
  }
}

export async function searchEmails(query: string) {
  logger.info('gmail', 'searchEmails called', { query })
  if (!isGmailConfigured()) return gmailNotConfiguredResponse()
  if (!gmailServer.isLoggedIn()) return gmailNotLoggedInResponse()
  try {
    return await gmailServer.searchEmails(query)
  } catch (error) {
    return { error: true, message: String(error) }
  }
}

export async function summarizeTodayEmails() {
  logger.info('gmail', 'summarizeTodayEmails called')
  if (!isGmailConfigured()) return gmailNotConfiguredResponse()
  if (!gmailServer.isLoggedIn()) return gmailNotLoggedInResponse()
  try {
    return await gmailServer.summarizeTodayEmails()
  } catch (error) {
    return { error: true, message: String(error) }
  }
}
