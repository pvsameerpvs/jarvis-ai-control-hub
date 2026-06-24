import { getDatabase } from '../db/connection'

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'
export type LogSource = 'system' | 'command' | 'ai' | 'vision' | 'connector' | 'gmail' | 'telegram'

export interface LogEntry {
  id?: number
  type: string
  message: string
  metadata?: string | null
  created_at?: string
}

class Logger {
  private logToDb(type: string, message: string, metadata?: Record<string, unknown>): void {
    try {
      const db = getDatabase()
      const stmt = db.prepare(
        'INSERT INTO command_logs (type, message, metadata) VALUES (?, ?, ?)'
      )
      stmt.run(type, message, metadata ? JSON.stringify(metadata) : null)
    } catch {
      console.error('Failed to write log to database')
    }
  }

  private formatMessage(level: LogLevel, source: LogSource, message: string): string {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${level.toUpperCase()}] [${source}] ${message}`
  }

  info(source: LogSource, message: string, metadata?: Record<string, unknown>): void {
    const formatted = this.formatMessage('info', source, message)
    console.log(formatted)
    this.logToDb(`${source}:info`, message, metadata)
  }

  warn(source: LogSource, message: string, metadata?: Record<string, unknown>): void {
    const formatted = this.formatMessage('warn', source, message)
    console.warn(formatted)
    this.logToDb(`${source}:warn`, message, metadata)
  }

  error(source: LogSource, message: string, metadata?: Record<string, unknown>): void {
    const formatted = this.formatMessage('error', source, message)
    console.error(formatted)
    this.logToDb(`${source}:error`, message, metadata)
  }

  debug(source: LogSource, message: string, metadata?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development' || process.env.LOG_LEVEL === 'debug') {
      const formatted = this.formatMessage('debug', source, message)
      console.debug(formatted)
      this.logToDb(`${source}:debug`, message, metadata)
    }
  }

  command(message: string, metadata?: Record<string, unknown>): void {
    this.info('command', message, metadata)
  }

  ai(message: string, metadata?: Record<string, unknown>): void {
    this.info('ai', message, metadata)
  }

  vision(message: string, metadata?: Record<string, unknown>): void {
    this.info('vision', message, metadata)
  }

  getRecentLogs(limit: number = 100): LogEntry[] {
    try {
      const db = getDatabase()
      const rows = db.prepare(
        'SELECT id, type, message, metadata, created_at FROM command_logs ORDER BY created_at DESC LIMIT ?'
      ).all(limit) as LogEntry[]
      return rows
    } catch {
      return []
    }
  }
}

export const logger = new Logger()
