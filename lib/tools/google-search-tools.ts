import { logger } from '@/lib/utils/logger'
import { chromium } from 'playwright'

export async function openGoogleSearch(query: string): Promise<{ action: string; url: string; query: string }> {
  logger.info('system', 'openGoogleSearch called', { query })

  const encodedQuery = encodeURIComponent(query)
  const url = `https://www.google.com/search?q=${encodedQuery}`

  return {
    action: 'open_browser',
    url,
    query,
  }
}

export async function openYouTubeSearch(query: string): Promise<{ action: string; url: string; query: string }> {
  logger.info('system', 'openYouTubeSearch called', { query })

  const encodedQuery = encodeURIComponent(query)
  const url = `https://www.youtube.com/results?search_query=${encodedQuery}`

  return {
    action: 'open_browser',
    url,
    query,
  }
}

export async function webResearchAnswer(query: string): Promise<{ result: string; query: string }> {
  logger.info('system', 'webResearchAnswer called', { query })

  let browser
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
      ],
    })

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    })

    const page = await context.newPage()

    const encodedQuery = encodeURIComponent(query)
    const searchUrl = `https://www.google.com/search?q=${encodedQuery}&hl=en`

    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 15000 })

    await page.waitForTimeout(1000)

    const results = await page.evaluate(() => {
      const items: string[] = []
      const searchResults = document.querySelectorAll('#search .g, #search .MjjYud')

      searchResults.forEach((div) => {
        const titleEl = div.querySelector('h3')
        const snippetEl = div.querySelector('.VwiC3b, .lEBKkf, [data-sncf], .st')
        const linkEl = div.querySelector('a') as HTMLAnchorElement | null

        if (titleEl) {
          const title = titleEl.textContent?.trim() || ''
          const snippet = snippetEl?.textContent?.trim() || ''
          const link = linkEl?.href || ''
          if (title) {
            items.push(`Title: ${title}\nLink: ${link}\nSummary: ${snippet}`)
          }
        }
      })

      return items.slice(0, 10)
    })

    await browser.close()

    if (results.length === 0) {
      return {
        result: `I searched for "${query}" but couldn't find any results. You might want to try a different search term.`,
        query,
      }
    }

    const formatted = results.map((r, i) => `Result ${i + 1}:\n${r}`).join('\n\n')
    return {
      result: `Here's what I found for "${query}":\n\n${formatted}`,
      query,
    }
  } catch (error) {
    logger.error('system', 'webResearchAnswer failed', { error: String(error) })
    if (browser) {
      try { await browser.close() } catch { /* ignore */ }
    }
    return {
      result: `I couldn't search the web right now due to: ${error}. Try asking me to open Google search in your browser instead.`,
      query,
    }
  }
}

export async function openWebsite(url: string): Promise<{ action: string; url: string }> {
  logger.info('system', 'openWebsite called', { url })

  let finalUrl = url
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    finalUrl = `https://${url}`
  }

  return {
    action: 'open_browser',
    url: finalUrl,
  }
}
