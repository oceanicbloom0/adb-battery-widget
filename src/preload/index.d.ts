import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onBatteryLevelUpdate: (callback: (event: Electron.IpcRendererEvent, level: number) => void) => void
    }
  }
}
