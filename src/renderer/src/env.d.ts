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
      onSettingsChanged: (callback: (event: any, settings: any) => void) => void
      openSettingsWindow: () => void
      checkForUpdatesNow: () => void
      scanNetworkDevices: () => void
      onScanResults: (
        callback: (
          event: import('electron').IpcRendererEvent,
          devices: { ip: string; port: number }[]
        ) => void
      ) => void
      pairDevice: (host: string, port: number, pairingCode: string) => Promise<string>
      getTheme: () => Promise<{
        shouldUseDarkColors: boolean
        themeSource: import('electron').NativeTheme['themeSource']
      }>
      onThemeChanged: (
        callback: (
          event: import('electron').IpcRendererEvent,
          theme: {
            shouldUseDarkColors: boolean
            themeSource: import('electron').NativeTheme['themeSource']
          }
        ) => void
      ) => () => void
    }
  }
}
