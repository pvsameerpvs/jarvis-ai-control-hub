import { chromium } from 'playwright'
import { logger } from '@/lib/utils/logger'

let browserInstance: Awaited<ReturnType<typeof chromium.launch>> | null = null

async function getBrowser(): Promise<Awaited<ReturnType<typeof chromium.launch>>> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await chromium.launch({
      headless: false,
      args: [
        '--start-maximized',
        '--disable-blink-features=AutomationControlled',
      ],
    })
    logger.info('system', 'Playwright browser launched')
  }
  return browserInstance
}

export async function openGoogleSearch(query: string): Promise<{ success: boolean; url: string; error?: string }> {
  const startTime = Date.now()
  logger.info('system', 'Browser: openGoogleSearch', { query })

  try {
    const browser = await getBrowser()
    const context = await browser.newContext({ viewport: null })
    const page = await context.newPage()

    const encodedQuery = encodeURIComponent(query)
    const url = `https://www.google.com/search?q=${encodedQuery}`
    await page.goto(url, { waitUntil: 'networkidle' })

    const duration = Date.now() - startTime
    logger.info('system', 'Google search opened in browser', { durationMs: duration })

    return { success: true, url }
  } catch (error) {
    logger.error('system', 'Browser: openGoogleSearch failed', { error: String(error) })
    return { success: false, url: '', error: String(error) }
  }
}

export async function openYouTubeSearch(query: string): Promise<{ success: boolean; url: string; error?: string }> {
  const startTime = Date.now()
  logger.info('system', 'Browser: openYouTubeSearch', { query })

  try {
    const browser = await getBrowser()
    const context = await browser.newContext({ viewport: null })
    const page = await context.newPage()

    const encodedQuery = encodeURIComponent(query)
    const url = `https://www.youtube.com/results?search_query=${encodedQuery}`
    await page.goto(url, { waitUntil: 'networkidle' })

    const duration = Date.now() - startTime
    logger.info('system', 'YouTube search opened in browser', { durationMs: duration })

    return { success: true, url }
  } catch (error) {
    logger.error('system', 'Browser: openYouTubeSearch failed', { error: String(error) })
    return { success: false, url: '', error: String(error) }
  }
}

export async function openWebsite(url: string): Promise<{ success: boolean; url: string; error?: string }> {
  const startTime = Date.now()
  logger.info('system', 'Browser: openWebsite', { url })

  try {
    const browser = await getBrowser()
    const context = await browser.newContext({ viewport: null })
    const page = await context.newPage()

    let finalUrl = url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = `https://${url}`
    }
    await page.goto(finalUrl, { waitUntil: 'networkidle' })

    const duration = Date.now() - startTime
    logger.info('system', 'Website opened in browser', { durationMs: duration })

    return { success: true, url: finalUrl }
  } catch (error) {
    logger.error('system', 'Browser: openWebsite failed', { error: String(error) })
    return { success: false, url, error: String(error) }
  }
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    try {
      await browserInstance.close()
      browserInstance = null
      logger.info('system', 'Playwright browser closed')
    } catch (error) {
      logger.error('system', 'Failed to close browser', { error: String(error) })
    }
  }
}
