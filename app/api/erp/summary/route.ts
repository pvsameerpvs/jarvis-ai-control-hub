import { NextResponse } from 'next/server'
import { getErpDashboardSummary } from '@/lib/tools/erp-connector-tools'
import { getConfig } from '@/lib/utils/config'
import { logger } from '@/lib/utils/logger'

export async function GET() {
  try {
    const summaryResult = await getErpDashboardSummary()

    if ('configured' in summaryResult && !summaryResult.configured) {
      return NextResponse.json({
        success: true,
        data: null,
        connectorStatus: 'not_configured',
        message: summaryResult.message,
      })
    }

    const activeConnector = getConfig('erp_connector_active')

    return NextResponse.json({
      success: true,
      data: summaryResult.summary,
      connectorStatus: 'active',
      connector: summaryResult.connector,
    })
  } catch (error) {
    logger.error('connector', 'ERP summary API error', { error: String(error) })
    return NextResponse.json(
      { success: false, data: null, connectorStatus: 'error', error: 'Failed to fetch ERP summary' },
      { status: 500 }
    )
  }
}
