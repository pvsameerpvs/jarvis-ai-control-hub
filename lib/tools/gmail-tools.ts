import { getConfig } from '@/lib/utils/config'
import { logger } from '@/lib/utils/logger'

function isGmailConfigured(): boolean {
  return getConfig('gmail_integration') === 'true'
}

function gmailNotConfiguredResponse(): { configured: false; message: string } {
  return {
    configured: false as const,
    message: 'Gmail integration is not configured. Please enable it in settings and connect your Gmail account.',
  }
}

export async function getTodayEmailCount(): Promise<{ count: number; message: string } | { configured: false; message: string }> {
  logger.info('gmail', 'getTodayEmailCount called')

  if (!isGmailConfigured()) {
    return gmailNotConfiguredResponse()
  }

  return {
    count: 0,
    message: 'Gmail integration is configured but the API is not yet connected. Returned mock count of 0.',
  }
}

export async function getUnreadEmailCount(): Promise<{ count: number; message: string } | { configured: false; message: string }> {
  logger.info('gmail', 'getUnreadEmailCount called')

  if (!isGmailConfigured()) {
    return gmailNotConfiguredResponse()
  }

  return {
    count: 0,
    message: 'Gmail integration is configured but the API is not yet connected. Returned mock count of 0.',
  }
}

export async function getLatestEmails(limit: number = 5): Promise<{ emails: unknown[]; message: string } | { configured: false; message: string }> {
  logger.info('gmail', 'getLatestEmails called', { limit })

  if (!isGmailConfigured()) {
    return gmailNotConfiguredResponse()
  }

  return {
    emails: [],
    message: `Gmail integration is configured but the API is not yet connected. Returned empty list (requested ${limit} emails).`,
  }
}

export async function searchEmails(query: string): Promise<{ emails: unknown[]; message: string; query: string } | { configured: false; message: string }> {
  logger.info('gmail', 'searchEmails called', { query })

  if (!isGmailConfigured()) {
    return gmailNotConfiguredResponse()
  }

  return {
    emails: [],
    query,
    message: `Gmail integration is configured but the API is not yet connected. Searched for "${query}" with 0 results.`,
  }
}

export async function summarizeTodayEmails(): Promise<{ summary: string } | { configured: false; message: string }> {
  logger.info('gmail', 'summarizeTodayEmails called')

  if (!isGmailConfigured()) {
    return gmailNotConfiguredResponse()
  }

  return {
    summary: 'No emails were received today. Gmail integration is configured but the API is not yet connected.',
  }
}
