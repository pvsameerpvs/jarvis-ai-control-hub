import { getDatabase } from '../db/connection'

let cache: Record<string, string> | null = null

export function getConfig(key: string): string | undefined {
  const all = getAllConfig()
  return all[key]
}

export function getAllConfig(): Record<string, string> {
  if (cache) return cache

  try {
    const db = getDatabase()
    const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[]
    const settings: Record<string, string> = {}
    for (const row of rows) {
      settings[row.key] = row.value
    }
    cache = settings
    return settings
  } catch {
    return {}
  }
}

export function getConfigAsNumber(key: string, defaultValue: number = 0): number {
  const val = getConfig(key)
  if (val === undefined) return defaultValue
  const parsed = Number(val)
  return isNaN(parsed) ? defaultValue : parsed
}

export function getConfigAsBoolean(key: string, defaultValue: boolean = false): boolean {
  const val = getConfig(key)
  if (val === undefined) return defaultValue
  return val === 'true' || val === '1'
}

export function setConfig(key: string, value: string): void {
  try {
    const db = getDatabase()
    db.prepare(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP'
    ).run(key, value, value)
    if (cache) {
      cache[key] = value
    }
  } catch {
    console.error(`Failed to set config key: ${key}`)
  }
}

export function setMultipleConfig(settings: Record<string, string>): void {
  try {
    const db = getDatabase()
    const upsert = db.prepare(
      'INSERT INTO settings (key, value) VALUES (@key, @value) ON CONFLICT(key) DO UPDATE SET value = @value, updated_at = CURRENT_TIMESTAMP'
    )
    const tx = db.transaction(() => {
      for (const [key, value] of Object.entries(settings)) {
        upsert.run({ key, value })
      }
    })
    tx()
    cache = null
  } catch {
    console.error('Failed to set multiple config keys')
  }
}

export function invalidateConfigCache(): void {
  cache = null
}
