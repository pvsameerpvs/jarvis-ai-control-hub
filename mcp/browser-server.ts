import { logger } from '@/lib/utils/logger'

export class BrowserServer {
  async openGoogleSearch(query: string): Promise<Record<string, unknown>> {
    logger.info('system', 'BrowserServer.openGoogleSearch', { query })
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`
    return { action: 'open_browser', url, query }
  }

  async openYouTubeSearch(query: string): Promise<Record<string, unknown>> {
    logger.info('system', 'BrowserServer.openYouTubeSearch', { query })
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
    return { action: 'open_browser', url, query }
  }

  async webResearch(query: string): Promise<Record<string, unknown>> {
    logger.info('system', 'BrowserServer.webResearch', { query })
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`
    return { result: `Search opened for: "${query}"`, url, query }
  }

  async openWebsite(url: string): Promise<Record<string, unknown>> {
    logger.info('system', 'BrowserServer.openWebsite', { url })
    let finalUrl = url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = `https://${url}`
    }
    return { action: 'open_browser', url: finalUrl }
  }
}

export const browserServer = new BrowserServer()
