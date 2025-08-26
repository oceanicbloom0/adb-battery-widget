import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onBatteryLevelUpdate: (
        callback: (event: Electron.IpcRendererEvent, level: number) => void
      ) => void
      getSettings: () => Promise<any>
      setSettings: (partialSettings: any) => Promise<any>
      onSettingsChanged: (callback: (event: any, settings: any) => void) => void
      openSettingsWindow: () => void
      checkForUpdatesNow: () => void
      pairDevice: (host: string, port: number, pairingCode: string) => Promise<string>
    }
  }
}
