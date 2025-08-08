/// <reference types="vite/client" />

export {}

declare global {
  interface Window {
    electron: any
    api: {
      onBatteryLevelUpdate: (
        callback: (event: import('electron').IpcRendererEvent, level: number | null) => void
      ) => void
      getSettings: () => Promise<{
        adb: { mode: 'usb' | 'tcp'; host: string; port: number; customPath: string }
        startup: { openAtLogin: boolean }
        updates: { autoCheck: boolean }
        display: { batteryStyle: 'circular' | 'horizontal' }
      }>
      setSettings: (partial: any) => Promise<any>
      openSettingsWindow: () => void
      checkForUpdatesNow: () => void
    }
  }
}
