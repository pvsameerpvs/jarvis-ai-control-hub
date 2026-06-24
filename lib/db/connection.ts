import Database from 'better-sqlite3'
import path from 'path'

let instance: Database.Database | null = null

export function getDbPath(): string {
  return process.env.DB_PATH || path.join(process.cwd(), 'data', 'jarvis-control-hub.db')
}

export function getDatabase(): Database.Database {
  if (!instance) {
    const dbPath = getDbPath()
    const dir = path.dirname(dbPath)
    const fs = require('fs')
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    instance = new Database(dbPath)
    instance.pragma('journal_mode = WAL')
    instance.pragma('foreign_keys = ON')
  }
  return instance
}

export function closeDatabase(): void {
  if (instance) {
    instance.close()
    instance = null
  }
}
