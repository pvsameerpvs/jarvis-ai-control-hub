import { logger } from '@/lib/utils/logger'

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

  const encodedQuery = encodeURIComponent(query)
  const searchUrl = `https://www.google.com/search?q=${encodedQuery}`

  return {
    result: `I've opened a search for "${query}" in your browser. Since I cannot browse the web directly, please check the browser for search results. URL: ${searchUrl}`,
    query,
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
