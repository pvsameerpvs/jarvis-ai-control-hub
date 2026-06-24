const { contextBridge, ipcRenderer } = require('electron')

const electronAPI = {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  getLogs: () => ipcRenderer.invoke('get-logs'),
  getSystemStatus: () => ipcRenderer.invoke('get-system-status'),
  executeCommand: (command) => ipcRenderer.invoke('execute-command', command),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
