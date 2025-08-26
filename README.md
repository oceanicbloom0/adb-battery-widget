# ADB Battery Widget

An Electron + Vue based Android device battery monitoring floating window application.

## Features

- **Real-time Battery Monitoring** - Get Android device battery level via ADB connection
- **Floating Window Display** - Compact desktop floating window showing real-time battery percentage
- **Flexible Connection Options** - Supports USB, TCP/IP, and wireless ADB pairing modes

## Installation

### Requirements

- Node.js >= 18
- Android Debug Bridge (ADB)
- Android device or emulator

### Development Setup

```bash
# Clone the project
git clone <repository-url>
cd adb-battery-widget

# Install dependencies
npm install

# Start development mode
npm run dev
```

### Build for Release

```bash
# Build the application
npm run build

# Build Windows installer
npm run build:win

# Build macOS application
npm run build:mac

# Build Linux application
npm run build:linux
```

## Usage Guide

### First Time Use

1. **Launch Application** - A floating window will appear in the top-right corner of your desktop
2. **Connect Device** - Ensure USB debugging is enabled on your Android device
3. **Configure Connection** - Right-click tray icon → "Open Settings"

### ADB Connection Configuration

#### USB Mode

- Connect device with USB cable
- Allow USB debugging on the device
- Select "USB" mode in settings

#### TCP/IP Mode

1. Ensure device and computer are on the same network
2. Execute on device: `adb tcpip 5555`
3. Get device IP address
4. Select "TCP/IP" mode in settings, enter IP and port

#### Wireless Pairing Mode

1. On Android device, enable "Wireless debugging" in Developer options
2. Note the pairing code, IP address, and port shown on device
3. Select "Wireless pairing" mode in settings
4. Enter IP, port, and pairing code
5. Application will automatically pair and connect to the device

### Tray Functions

Right-click tray icon to access:

- **Open Settings** - Configure ADB connection and general options
- **Check for Updates** - Manually check for application updates
- **Exit** - Close the application

## 🛠️ Development

### Project Structure

```
src/
├── main/           # Electron main process
│   └── index.ts   # Main process entry, ADB connection logic
├── preload/        # Preload scripts
│   └── index.ts   # IPC communication bridge
└── renderer/       # Renderer process
    ├── src/
    │   ├── App.vue        # Floating window component
    │   ├── Settings.vue   # Settings page
    │   └── main.ts        # Renderer process entry
    └── index.html         # HTML template
```

### Development Commands

```bash
# Development mode (auto-opens DevTools)
npm run dev

# Type checking
npm run typecheck

# Code formatting
npm run format

# Code linting
npm run lint

# Build application
npm run build

# Preview build results
npm run start
```

## ⚙️ Configuration

### Settings

- **ADB Connection**
  - Mode: USB / TCP/IP / Wireless pairing
  - Host: Device IP for TCP/Wireless mode
  - Port: Port for TCP/Wireless mode (default 5555)
  - Pairing Code: Required for wireless pairing mode

- **General Settings**
  - Launch at Login: Whether to start application automatically
  - Auto Check Updates: Whether to automatically check for updates

### Configuration Files

Application configuration is saved at:

- Windows: `%APPDATA%/adb-battery-widget/settings.json`
- macOS: `~/Library/Application Support/adb-battery-widget/settings.json`
- Linux: `~/.config/adb-battery-widget/settings.json`

## 📄 License

MIT License
