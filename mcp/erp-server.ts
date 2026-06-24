import { getConfig, getConfigAsBoolean } from '@/lib/utils/config'
import { getDatabase } from '@/lib/db/connection'
import { logger } from '@/lib/utils/logger'

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

export class ErpServer {
  private configured: boolean

  constructor() {
    this.configured = getConfigAsBoolean('erp_connector_active', false)
  }

  async getDashboardSummary(): Promise<Record<string, unknown>> {
    logger.info('connector', 'ErpServer.getDashboardSummary')
    if (!this.configured) return { configured: false, message: 'ERP connector is not configured.' }
    const connector = getActiveConnector()
    if (!connector) return { configured: false, message: 'No active ERP connector found.' }
    return {
      configured: true,
      connector: connector.name,
      summary: { totalLeads: 0, todayLeads: 0, pendingLeads: 0, convertedLeads: 0 },
    }
  }

  async getTodayLeads(): Promise<Record<string, unknown>> {
    logger.info('connector', 'ErpServer.getTodayLeads')
    if (!this.configured) return { configured: false, message: 'ERP connector is not configured.' }
    const connector = getActiveConnector()
    return { configured: !!connector, connector: connector?.name || '', leads: [] }
  }

  async getPendingLeads(): Promise<Record<string, unknown>> {
    logger.info('connector', 'ErpServer.getPendingLeads')
    if (!this.configured) return { configured: false, message: 'ERP connector is not configured.' }
    const connector = getActiveConnector()
    return { configured: !!connector, connector: connector?.name || '', leads: [] }
  }

  async getConvertedLeads(): Promise<Record<string, unknown>> {
    logger.info('connector', 'ErpServer.getConvertedLeads')
    if (!this.configured) return { configured: false, message: 'ERP connector is not configured.' }
    const connector = getActiveConnector()
    return { configured: !!connector, connector: connector?.name || '', leads: [] }
  }

  async searchLeads(query: string): Promise<Record<string, unknown>> {
    logger.info('connector', 'ErpServer.searchLeads', { query })
    if (!this.configured) return { configured: false, message: 'ERP connector is not configured.' }
    const connector = getActiveConnector()
    return { configured: !!connector, connector: connector?.name || '', query, leads: [] }
  }

  async openPage(pageName: string): Promise<Record<string, unknown>> {
    logger.info('connector', 'ErpServer.openPage', { pageName })
    if (!this.configured) return { configured: false, message: 'ERP connector is not configured.' }
    const connector = getActiveConnector()
    const baseUrl = (connector?.config as Record<string, string>)?.base_url || ''
    return { action: 'open_browser', page: pageName, url: baseUrl ? `${baseUrl}/${pageName}` : `erp://${pageName}` }
  }
}

export const erpServer = new ErpServer()
