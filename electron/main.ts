import { app, BrowserWindow, ipcMain } from 'electron'
import { exec } from 'child_process'
import path from 'path'
import Database from 'better-sqlite3'

let mainWindow: BrowserWindow | null = null
let db: Database.Database | null = null

function getDbPath(): string {
  return process.env.DB_PATH || path.join(app.getPath('userData'), 'jarvis.db')
}

function initDatabase(): void {
  const dbPath = getDbPath()
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
}

function getDatabase(): Database.Database {
  if (!db) {
    initDatabase()
  }
  return db!
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  mainWindow.loadURL('http://localhost:3000')

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function setupIpcHandlers(): void {
  ipcMain.handle('get-settings', () => {
    const database = getDatabase()
    const rows = database.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[]
    const settings: Record<string, string> = {}
    for (const row of rows) {
      settings[row.key] = row.value
    }
    return settings
  })

  ipcMain.handle('save-settings', (_event, settings: Record<string, string>) => {
    const database = getDatabase()
    const upsert = database.prepare(
      'INSERT INTO settings (key, value) VALUES (@key, @value) ON CONFLICT(key) DO UPDATE SET value = @value, updated_at = CURRENT_TIMESTAMP'
    )
    const tx = database.transaction(() => {
      for (const [key, value] of Object.entries(settings)) {
        upsert.run({ key, value })
      }
    })
    tx()
    return { success: true }
  })

  ipcMain.handle('get-logs', () => {
    const database = getDatabase()
    const rows = database.prepare(
      'SELECT id, type, message, metadata, created_at FROM command_logs ORDER BY created_at DESC LIMIT 100'
    ).all()
    return rows
  })

  ipcMain.handle('get-system-status', () => {
    const platform = process.platform
    const memoryUsage = process.memoryUsage()
    return {
      platform,
      memory: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        rss: memoryUsage.rss,
      },
      uptime: process.uptime(),
      nodeVersion: process.version,
    }
  })

  ipcMain.handle('execute-command', (_event, command: string) => {
    return new Promise((resolve, reject) => {
      const isWindows = process.platform === 'win32'
      let cmd: string

      if (isWindows) {
        cmd = `start "" ${command}`
      } else if (process.platform === 'darwin') {
        cmd = `open ${command}`
      } else {
        if (command.startsWith('vscode') || command.includes('code')) {
          cmd = command
        } else if (command.startsWith('terminal') || command.includes('terminal')) {
          cmd = command
        } else {
          cmd = command
        }
      }

      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          reject({ error: error.message, stderr })
        } else {
          resolve({ stdout, stderr })
        }
      })
    })
  })
}

app.whenReady().then(() => {
  initDatabase()
  setupIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (db) {
    db.close()
    db = null
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
