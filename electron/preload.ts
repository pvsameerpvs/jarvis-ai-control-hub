import { contextBridge, ipcRenderer } from 'electron'

export interface ElectronAPI {
  getSettings: () => Promise<Record<string, string>>
  saveSettings: (settings: Record<string, string>) => Promise<{ success: boolean }>
  getLogs: () => Promise<Array<{
    id: number
    type: string
    message: string
    metadata: string | null
    created_at: string
  }>>
  getSystemStatus: () => Promise<{
    platform: string
    memory: { heapUsed: number; heapTotal: number; rss: number }
    uptime: number
    nodeVersion: string
  }>
  executeCommand: (command: string) => Promise<{ stdout: string; stderr: string }>
}

const electronAPI: ElectronAPI = {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  getLogs: () => ipcRenderer.invoke('get-logs'),
  getSystemStatus: () => ipcRenderer.invoke('get-system-status'),
  executeCommand: (command) => ipcRenderer.invoke('execute-command', command),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
