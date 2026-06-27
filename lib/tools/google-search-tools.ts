import { logger } from '@/lib/utils/logger'

export async function openGoogleSearch(query: string): Promise<{ action: string; url: string; query: string }> {
  logger.info('system', 'openGoogleSearch called', { query })
  const encodedQuery = encodeURIComponent(query)
  const url = `https://www.google.com/search?q=${encodedQuery}`
  return { action: 'open_browser', url, query }
}

export async function openYouTubeSearch(query: string): Promise<{ action: string; url: string; query: string }> {
  logger.info('system', 'openYouTubeSearch called', { query })
  const encodedQuery = encodeURIComponent(query)
  const url = `https://www.youtube.com/results?search_query=${encodedQuery}`
  return { action: 'open_browser', url, query }
}

export async function webResearchAnswer(query: string): Promise<{ result: string; query: string }> {
  logger.info('system', 'webResearchAnswer called', { query })
  try {
    const encodedQuery = encodeURIComponent(query)
    const searchUrl = `https://www.google.com/search?q=${encodedQuery}&hl=en`

    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(10000),
    })

    const html = await res.text()

    const snippets: string[] = []
    const titleRegex = /<h3[^>]*>(.*?)<\/h3>/gi
    const snippetRegex = /<span[^>]*class="[^"]*(?:VwiC3b|st|lEBKkf)[^"]*"[^>]*>(.*?)<\/span>/gi

    let match
    while ((match = titleRegex.exec(html)) !== null && snippets.length < 5) {
      const title = match[1].replace(/<[^>]*>/g, '').trim()
      snippets.push(title)
    }

    if (snippets.length === 0) {
      return {
        result: `I searched for "${query}" but couldn't extract results. I've opened Google search in your browser so you can see the results directly.`,
        query,
      }
    }

    const formatted = snippets.map((s, i) => `${i + 1}. ${s}`).join('\n')
    return {
      result: `Here's what I found for "${query}":\n\n${formatted}\n\nI've also opened the search in your browser for more details.`,
      query,
    }
  } catch {
    return {
      result: `I couldn't search the web right now. I'll open Google search in your browser instead so you can check directly.`,
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
  return { action: 'open_browser', url: finalUrl }
}
