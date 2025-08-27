import { app, shell, BrowserWindow, ipcMain, Tray, Menu, nativeImage, nativeTheme } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
// Use default export (class Adb) to access static helpers like util/readAll
const Adb = require('@devicefarmer/adbkit').default
// electron-store 是 ESM。为了在 CJS 打包环境下兼容，这里做 default 兼容处理
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ElectronStoreLib = require('electron-store')
const Store = (ElectronStoreLib.default ??
  ElectronStoreLib) as typeof import('electron-store').default
// electron-store 需要在主进程初始化一次，以便渲染进程可用
if (typeof Store.initRenderer === 'function') {
  // 在主进程注册 IPC handler
  Store.initRenderer()
}
const { autoUpdater } = require('electron-updater')

const store = new Store({
  name: 'settings',
  defaults: {
    adb: { mode: 'usb', host: '127.0.0.1', port: 5555, customPath: '', pairingCode: '' },
    startup: { openAtLogin: false },
    updates: { autoCheck: true },
    display: { batteryStyle: 'circular' }
  }
})

let tray: Tray | null = null
let mainWindow: BrowserWindow | null = null
let settingsWindow: BrowserWindow | null = null

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 124, // Match widget width
    height: 96, // Match widget height
    show: false,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true, // 隐藏悬浮窗在任务栏的显示
    title: 'ADB Battery Widget',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    if (is.dev) {
      mainWindow?.webContents.openDevTools({ mode: 'detach' })
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html')).catch((err) => {
      console.error('Failed to load main window:', err)
    })
  }
}

function createTray(): void {
  const image = nativeImage.createFromPath(join(__dirname, is.dev ? '../../resources/icon.png' : '../resources/icon.png'))
  tray = new Tray(image)
  const contextMenu = Menu.buildFromTemplate([
    { label: '打开设置', click: () => openSettingsWindow() },
    { type: 'separator' },
    { label: '检查更新', click: () => autoUpdater.checkForUpdatesAndNotify() },
    { type: 'separator' },
    { label: '退出', role: 'quit' }
  ])
  tray.setToolTip('ADB Battery Widget')
  tray.setContextMenu(contextMenu)
}

function openSettingsWindow(): void {
  if (settingsWindow) {
    settingsWindow.focus()
    return
  }
  settingsWindow = new BrowserWindow({
    width: 800,
    height: 500,
    title: 'ADB Battery Widget - 设置',
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    settingsWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#/settings')
  } else {
    settingsWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: 'settings'
    }).catch((err) => {
      console.error('Failed to load settings window:', err)
    })
  }
  if (is.dev) {
    settingsWindow.webContents.openDevTools({ mode: 'detach' })
  }
  settingsWindow.on('closed', () => {
    settingsWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC for theme
  ipcMain.handle('theme:get', () => ({
    shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
    themeSource: nativeTheme.themeSource
  }))
  
  // Listen for theme changes
  nativeTheme.on('updated', () => {
    const allWindows = BrowserWindow.getAllWindows()
    allWindows.forEach(window => {
      if (!window.isDestroyed()) {
        window.webContents.send('theme:changed', {
          shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
          themeSource: nativeTheme.themeSource
        })
      }
    })
  })

  // IPC for settings
  ipcMain.handle('settings:get', () => store.store)
  ipcMain.handle('settings:set', (_e, partial) => {
    if (partial && typeof partial === 'object') {
      // 只保存可序列化的数据，避免克隆错误
      if ('adb' in partial && partial.adb) {
        const adbSettings = {
          mode: partial.adb.mode || 'usb',
          host: partial.adb.host || '127.0.0.1',
          port: parseInt(partial.adb.port) || 5555,
          customPath: partial.adb.customPath || '',
          pairingCode: partial.adb.pairingCode || ''
        }
        store.set('adb', adbSettings)
      }
      if ('startup' in partial && partial.startup) {
        store.set('startup', {
          openAtLogin: Boolean(partial.startup.openAtLogin)
        })
      }
      if ('updates' in partial && partial.updates) {
        store.set('updates', {
          autoCheck: Boolean(partial.updates.autoCheck)
        })
      }
      if ('display' in partial && partial.display) {
        store.set('display', {
          batteryStyle: partial.display.batteryStyle || 'circular'
        })
      }
    }
    applySettings()
    return store.store
  })
  ipcMain.on('settings:open', () => openSettingsWindow())
  ipcMain.on('updates:check-now', () => autoUpdater.checkForUpdatesAndNotify())
  
  // Pair device with pairing code
  ipcMain.handle('adb:pair-device', async (_e, host: string, port: number, pairingCode: string) => {
    try {
      const { exec } = require('child_process')
      const adbPath = getAdbPath()
      
      const pairCommand = `"${adbPath}" pair ${host}:${port} ${pairingCode}`
      
      return new Promise((resolve, reject) => {
        exec(pairCommand, (error, stdout, stderr) => {
          if (error) {
            console.error('Pairing failed:', error)
            reject(new Error(`配对失败: ${stderr || stdout || error.message}`))
            return
          }
          
          console.log('Pairing successful:', stdout)
          
          // After successful pairing, connect to the device
          const connectCommand = `"${adbPath}" connect ${host}:${port}`
          exec(connectCommand, (connectError, connectStdout, connectStderr) => {
            if (connectError) {
              console.error('Connection failed after pairing:', connectError)
              reject(new Error(`连接失败: ${connectStderr || connectStdout || connectError.message}`))
              return
            }
            
            console.log('Connection successful:', connectStdout)
            
            // Update settings to reflect successful connection
            store.set('adb', {
              ...store.get('adb'),
              host,
              port,
              pairingCode
            })
            
            resolve(`配对成功并已连接: ${stdout}\n${connectStdout}`)
          })
        })
      })
    } catch (error) {
      console.error('Pairing error:', error)
      throw error
    }
  })

  createWindow()
  createTray()

  // Startup on login
  const openAtLogin = store.get('startup.openAtLogin') as boolean
  app.setLoginItemSettings({ openAtLogin })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // ADB connection settings
  const adbMode = store.get('adb.mode') as string
  const deviceHost = store.get('adb.host') as string
  const devicePort = (store.get('adb.port') as number) || 5555
  const customAdbPath = store.get('adb.customPath') as string

  // Get bundled ADB path
  const getAdbPath = () => {
    if (customAdbPath) return customAdbPath
    
    // In production, ADB is bundled with the app
    if (app.isPackaged) {
      return join(process.resourcesPath, 'app.asar.unpacked', 'adb.exe')
    }
    
    // In development, use the ADB in project root
    return join(__dirname, '../../adb.exe')
  }

  // Create ADB client with custom path if specified
  const client = Adb.createClient({
    bin: getAdbPath()
  })


  const trackDevice = () => {
    client
      .listDevices()
      .then((devices) => {
        if (devices.length > 0) {
          const device = devices[0]
          console.log('Device found:', device.id)
          setInterval(() => {
            client
              .getDevice(device.id)
              .shell('dumpsys battery')
              .then(Adb.util.readAll)
              .then(function (output) {
                const batteryInfo = output.toString().trim()
                const levelMatch = batteryInfo.match(/level: (\d+)/)
                if (levelMatch) {
                  const batteryLevel = parseInt(levelMatch[1], 10)
                  console.log('Battery level:', batteryLevel)
                  const win = BrowserWindow.getAllWindows()[0]
                  if (!win) return
                  win.webContents.send('battery-level-update', batteryLevel)
                }
              })
          }, 5000)
        } else {
          console.log('No device found, retrying in 10s...')
          const win = BrowserWindow.getAllWindows()[0]
          if (win) {
            win.webContents.send('battery-level-update', null)
          }
          setTimeout(trackDevice, 10000)
        }
      })
      .catch((err) => {
        console.error('Error listing devices:', err)
        setTimeout(trackDevice, 10000)
      })
  }

  const connectByMode = () => {
    if (adbMode === 'tcp') {
      client
        .connect(deviceHost, devicePort)
        .then(trackDevice)
        .catch((err) => {
          console.error('Failed to connect to device via TCP, fallback to USB.', err)
          trackDevice()
        })
    } else if (adbMode === 'wireless') {
      // Wireless mode - just try to connect to already paired device
      if (deviceHost && devicePort) {
        client
          .connect(deviceHost, devicePort)
          .then(trackDevice)
          .catch((err) => {
            console.error('Failed to connect to wireless device, fallback to USB.', err)
            trackDevice()
          })
      } else {
        console.error('Missing wireless connection information')
        trackDevice() // Fallback to USB
      }
    } else {
      // USB mode: just start tracking
      trackDevice()
    }
  }

  connectByMode()
  applySettings()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function applySettings(): void {
  const openAtLogin = store.get('startup.openAtLogin') as boolean
  app.setLoginItemSettings({ openAtLogin })

  const autoCheck = store.get('updates.autoCheck') as boolean
  if (autoCheck && !is.dev) {
    autoUpdater.autoDownload = true
    autoUpdater.checkForUpdatesAndNotify()
  }

  // Notify renderer processes about settings changes
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('settings:changed', store.store)
  }
}
