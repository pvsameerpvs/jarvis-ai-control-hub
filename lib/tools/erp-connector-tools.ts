import { getConfig, getConfigAsBoolean } from '@/lib/utils/config'
import { getDatabase } from '@/lib/db/connection'
import { logger } from '@/lib/utils/logger'

function isErpConfigured(): boolean {
  return getConfigAsBoolean('erp_connector_active', false)
}

function erpNotConfiguredResponse(): { configured: false; message: string } {
  return {
    configured: false as const,
    message: 'ERP connector is not configured. Please set up an ERP connector in settings first.',
  }
}

function getActiveConnector(): { name: string; type: string; config: Record<string, unknown> } | null {
  try {
    const db = getDatabase()
    const rows = db.prepare(
      'SELECT name, type, config FROM erp_connectors WHERE is_active = 1 LIMIT 1'
    ).all() as { name: string; type: string; config: string }[]

    if (rows.length === 0) return null

    return {
      name: rows[0].name,
      type: rows[0].type,
      config: JSON.parse(rows[0].config),
    }
  } catch {
    return null
  }
}

export async function getErpDashboardSummary(): Promise<
  { configured: true; connector: string; summary: Record<string, unknown> }
  | { configured: false; message: string }
> {
  logger.info('connector', 'getErpDashboardSummary called')

  if (!isErpConfigured()) {
    return erpNotConfiguredResponse()
  }

  const connector = getActiveConnector()
  if (!connector) {
    return {
      configured: false,
      message: 'No active ERP connector found. Please configure a connector in settings.',
    }
  }

  return {
    configured: true,
    connector: connector.name,
    summary: {
      totalLeads: 0,
      todayLeads: 0,
      pendingLeads: 0,
      convertedLeads: 0,
      message: `ERP connector "${connector.name}" is configured but not yet connected. Data will be available once the connection is established.`,
    },
  }
}

export async function getTodayLeads(): Promise<
  { configured: true; connector: string; leads: unknown[] }
  | { configured: false; message: string }
> {
  logger.info('connector', 'getTodayLeads called')

  if (!isErpConfigured()) {
    return erpNotConfiguredResponse()
  }

  const connector = getActiveConnector()
  if (!connector) {
    return { configured: false, message: 'No active ERP connector found.' }
  }

  return {
    configured: true,
    connector: connector.name,
    leads: [],
  }
}

export async function getPendingLeads(): Promise<
  { configured: true; connector: string; leads: unknown[] }
  | { configured: false; message: string }
> {
  logger.info('connector', 'getPendingLeads called')

  if (!isErpConfigured()) {
    return erpNotConfiguredResponse()
  }

  const connector = getActiveConnector()
  if (!connector) {
    return { configured: false, message: 'No active ERP connector found.' }
  }

  return {
    configured: true,
    connector: connector.name,
    leads: [],
  }
}

export async function getConvertedLeads(): Promise<
  { configured: true; connector: string; leads: unknown[] }
  | { configured: false; message: string }
> {
  logger.info('connector', 'getConvertedLeads called')

  if (!isErpConfigured()) {
    return erpNotConfiguredResponse()
  }

  const connector = getActiveConnector()
  if (!connector) {
    return { configured: false, message: 'No active ERP connector found.' }
  }

  return {
    configured: true,
    connector: connector.name,
    leads: [],
  }
}

export async function searchErpLeads(query: string): Promise<
  { configured: true; connector: string; query: string; leads: unknown[] }
  | { configured: false; message: string }
> {
  logger.info('connector', 'searchErpLeads called', { query })

  if (!isErpConfigured()) {
    return erpNotConfiguredResponse()
  }

  const connector = getActiveConnector()
  if (!connector) {
    return { configured: false, message: 'No active ERP connector found.' }
  }

  return {
    configured: true,
    connector: connector.name,
    query,
    leads: [],
  }
}

export async function openErpPage(pageName: string): Promise<
  { action: string; page: string; url: string } |
  { configured: false; message: string }
> {
  logger.info('connector', 'openErpPage called', { pageName })

  if (!isErpConfigured()) {
    return erpNotConfiguredResponse()
  }

  const connector = getActiveConnector()
  if (!connector) {
    return { configured: false, message: 'No active ERP connector found.' }
  }

  const connectorConfig = connector.config as Record<string, string>
  const baseUrl = connectorConfig.base_url || ''

  return {
    action: 'open_browser',
    page: pageName,
    url: baseUrl ? `${baseUrl}/${pageName}` : `erp://${pageName}`,
  }
}
