import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  onBatteryLevelUpdate: (callback: (event: Electron.IpcRendererEvent, level: number) => void) =>
    ipcRenderer.on('battery-level-update', callback),
  getSettings: async () => ipcRenderer.invoke('settings:get'),
  setSettings: async (partialSettings: any) => ipcRenderer.invoke('settings:set', partialSettings),
  onSettingsChanged: (callback: (event: any, settings: any) => void) => ipcRenderer.on('settings:changed', callback),
  openSettingsWindow: () => ipcRenderer.send('settings:open'),
  checkForUpdatesNow: () => ipcRenderer.send('updates:check-now'),
  pairDevice: async (host: string, port: number, pairingCode: string) => 
    ipcRenderer.invoke('adb:pair-device', host, port, pairingCode),
  getTheme: async () => ipcRenderer.invoke('theme:get'),
  onThemeChanged: (callback: (event: any, theme: any) => void) => {
    ipcRenderer.on('theme:changed', callback)
    return () => ipcRenderer.removeListener('theme:changed', callback)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
