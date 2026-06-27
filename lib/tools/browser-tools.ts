import { exec } from 'child_process'
import { promisify } from 'util'
import { logger } from '@/lib/utils/logger'

const execAsync = promisify(exec)

function openUrl(url: string): Promise<void> {
  const platform = process.platform
  if (platform === 'darwin') {
    return execAsync(`open "${url}"`).then(() => {})
  } else if (platform === 'win32') {
    return execAsync(`start "" "${url}"`).then(() => {})
  }
  return execAsync(`xdg-open "${url}"`).then(() => {})
}

export async function openGoogleSearch(query: string): Promise<{ success: boolean; url: string; error?: string }> {
  logger.info('system', 'Browser: openGoogleSearch', { query })
  try {
    const encodedQuery = encodeURIComponent(query)
    const url = `https://www.google.com/search?q=${encodedQuery}`
    await openUrl(url)
    return { success: true, url }
  } catch (error) {
    logger.error('system', 'Browser: openGoogleSearch failed', { error: String(error) })
    return { success: false, url: '', error: String(error) }
  }
}

export async function openYouTubeSearch(query: string): Promise<{ success: boolean; url: string; error?: string }> {
  logger.info('system', 'Browser: openYouTubeSearch', { query })
  try {
    const encodedQuery = encodeURIComponent(query)
    const url = `https://www.youtube.com/results?search_query=${encodedQuery}`
    await openUrl(url)
    return { success: true, url }
  } catch (error) {
    logger.error('system', 'Browser: openYouTubeSearch failed', { error: String(error) })
    return { success: false, url: '', error: String(error) }
  }
}

async function findYouTubeVideoId(query: string): Promise<string | null> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (apiKey && apiKey !== 'your_youtube_api_key') {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=1&type=video`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (res.ok) {
      const data: any = await res.json()
      const videoId = data.items?.[0]?.id?.videoId
      if (videoId) return videoId
    }
  }

  const htmlRes = await fetch(
    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
    {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(8000),
    }
  )
  const html = await htmlRes.text()
  const match = html.match(/videoId["']?\s*:\s*["']([^"']+)["']/)
  return match?.[1] ?? null
}

export async function playYouTubeVideo(query: string): Promise<{ success: boolean; url: string; error?: string; message?: string }> {
  logger.info('system', 'Browser: playYouTubeVideo', { query })
  try {
    const videoId = await findYouTubeVideoId(query)
    if (videoId) {
      const url = `https://www.youtube.com/watch?v=${videoId}`
      await openUrl(url)
      return { success: true, url, message: `Playing "${query}" on YouTube now.` }
    }

    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
    await openUrl(searchUrl)
    return { success: true, url: searchUrl, message: `I found the video and opened it directly in your browser. It should start playing now.` }
  } catch (error) {
    logger.error('system', 'Browser: playYouTubeVideo failed', { error: String(error) })
    return { success: false, url: '', error: String(error) }
  }
}

export async function openWebsite(url: string): Promise<{ success: boolean; url: string; error?: string }> {
  logger.info('system', 'Browser: openWebsite', { url })
  try {
    let finalUrl = url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = `https://${url}`
    }
    await openUrl(finalUrl)
    return { success: true, url: finalUrl }
  } catch (error) {
    logger.error('system', 'Browser: openWebsite failed', { error: String(error) })
    return { success: false, url, error: String(error) }
  }
}

export async function closeBrowser(): Promise<void> {
  // No-op: system browser doesn't need closing
}
