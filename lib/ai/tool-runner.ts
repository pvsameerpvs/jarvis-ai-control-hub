import * as cameraTools from '@/lib/tools/camera-tools'
import * as gmailTools from '@/lib/tools/gmail-tools'
import * as telegramTools from '@/lib/tools/telegram-tools'
import * as googleSearchTools from '@/lib/tools/google-search-tools'
import * as browserTools from '@/lib/tools/browser-tools'
import * as erpTools from '@/lib/tools/erp-connector-tools'
import * as systemTools from '@/lib/tools/system-tools'
import { logger } from '@/lib/utils/logger'
import { requiresConfirmation } from '@/lib/tools/safety'

export type ToolResult = {
  success: boolean
  data: unknown
  error?: string
  requiresConfirmation?: boolean
  confirmationMessage?: string
}

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const startTime = Date.now()
  logger.ai(`Executing tool: ${toolName}`, { args })

  try {
    const toolModules: Record<string, Record<string, (...args: unknown[]) => unknown>> = {
      getCurrentTime: generalTools,
      getSystemStatus: generalTools,
      openCamera: cameraTools as any,
      captureCameraFrame: cameraTools as any,
      analyzeCameraImage: cameraTools as any,
      explainVisibleObject: cameraTools as any,
      readDocumentFromCamera: cameraTools as any,
      getTodayEmailCount: gmailTools as any,
      getUnreadEmailCount: gmailTools as any,
      getLatestEmails: gmailTools as any,
      searchEmails: gmailTools as any,
      summarizeTodayEmails: gmailTools as any,
      sendTelegramMessage: telegramTools as any,
      sendTodayReportToTelegram: telegramTools as any,
      openGoogleSearch: browserTools as any,
      openYouTubeSearch: browserTools as any,
      webResearchAnswer: googleSearchTools as any,
      openWebsite: browserTools as any,
      getErpDashboardSummary: erpTools as any,
      getTodayLeads: erpTools as any,
      getPendingLeads: erpTools as any,
      getConvertedLeads: erpTools as any,
      searchErpLeads: erpTools as any,
      openErpPage: erpTools as any,
      openVSCode: systemTools as any,
      openProjectFolder: systemTools as any,
      startLocalServer: systemTools as any,
      openTerminal: systemTools as any,
    }

    const module = toolModules[toolName]
    if (!module) {
      return { success: false, data: null, error: `Unknown tool: ${toolName}` }
    }

    const func = (module as any)[toolName]
    if (!func || typeof func !== 'function') {
      return { success: false, data: null, error: `Tool function not found: ${toolName}` }
    }

    const needsConfirm = requiresConfirmation(toolName)
    if (needsConfirm) {
      return {
        success: true,
        data: null,
        requiresConfirmation: true,
        confirmationMessage: `I need to use the "${toolName}" tool. Shall I proceed?`,
      }
    }

    const params = argsToParams(args)
    const result = await func(...params)

    const duration = Date.now() - startTime
    logger.ai(`Tool executed: ${toolName}`, {
      durationMs: duration,
      success: true,
    })

    return { success: true, data: result }
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('ai', `Tool execution failed: ${toolName}`, {
      error: String(error),
      durationMs: duration,
    })
    return { success: false, data: null, error: String(error) }
  }
}

function argsToParams(args: Record<string, unknown>): unknown[] {
  const keys = Object.keys(args)
  if (keys.length === 0) return []
  return keys.map(k => args[k])
}

const generalTools = {
  getCurrentTime: () => {
    const now = new Date()
    return {
      datetime: now.toISOString(),
      date: now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  },
  getSystemStatus: () => {
    const memoryUsage = process.memoryUsage()
    return {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      uptime: Math.floor(process.uptime()),
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
      },
      cpuUsage: process.cpuUsage(),
    }
  },
}
