# ADB Battery Widget

一个基于 Electron + Vue 的 Android 设备电池电量监控悬浮窗应用。

## ✨ 功能特性

- **实时电池监控** - 通过 ADB 连接获取 Android 设备电池电量
- **悬浮窗显示** - 小巧的桌面悬浮窗，实时显示电池百分比
- **灵活连接方式** - 支持 USB 和 TCP/IP 两种 ADB 连接模式

## 📦 安装

### 环境要求

- Node.js >= 18
- Android Debug Bridge (ADB)
- Android 设备或模拟器

### 开发环境

```bash
# 克隆项目
git clone <repository-url>
cd adb-battery-widget

# 安装依赖
npm install

# 启动开发模式
npm run dev
```

### 构建发布

```bash
# 构建应用
npm run build

# 构建 Windows 安装包
npm run build:win

# 构建 macOS 应用
npm run build:mac

# 构建 Linux 应用
npm run build:linux
```

## 🚀 使用说明

### 首次使用

1. **启动应用** - 运行后会在桌面右上角显示悬浮窗
2. **连接设备** - 确保 Android 设备已启用 USB 调试
3. **配置连接** - 右键托盘图标 → "打开设置"

### ADB 连接配置

#### USB 模式（推荐）

- 用 USB 线连接设备
- 在设备上允许 USB 调试
- 设置中选择 "USB" 模式

#### TCP/IP 模式

1. 设备与电脑在同一网络
2. 在设备上执行：`adb tcpip 5555`
3. 获取设备 IP 地址
4. 设置中选择 "TCP/IP" 模式，填入 IP 和端口

### 托盘功能

右键托盘图标可访问：

- **打开设置** - 配置 ADB 连接和通用选项
- **检查更新** - 手动检查应用更新
- **退出** - 关闭应用

## 🛠️ 开发

### 项目结构

```
src/
├── main/           # Electron 主进程
│   └── index.ts   # 主进程入口，ADB 连接逻辑
├── preload/        # 预加载脚本
│   └── index.ts   # IPC 通信桥接
└── renderer/       # 渲染进程
    ├── src/
    │   ├── App.vue        # 悬浮窗组件
    │   ├── Settings.vue   # 设置页面
    │   └── main.ts        # 渲染进程入口
    └── index.html         # HTML 模板
```

### 技术栈

- **Electron** - 桌面应用框架
- **Vue 3** - 前端框架
- **Vuetify** - Material Design UI 组件库
- **TypeScript** - 类型安全
- **@devicefarmer/adbkit** - ADB 客户端库
- **electron-store** - 配置持久化
- **electron-updater** - 自动更新

### 开发命令

```bash
# 开发模式（自动打开 DevTools）
npm run dev

# 类型检查
npm run typecheck

# 代码格式化
npm run format

# 代码检查
npm run lint

# 构建
npm run build

# 预览构建结果
npm run start
```

## ⚙️ 配置说明

### 设置项

- **ADB 连接**
  - 模式：USB / TCP/IP
  - 主机：TCP 模式下的设备 IP
  - 端口：TCP 模式下的端口（默认 5555）

- **通用设置**
  - 开机自启：应用是否随系统启动
  - 自动检查更新：是否自动检查应用更新

### 配置文件

应用配置保存在：

- Windows: `%APPDATA%/adb-battery-widget/settings.json`
- macOS: `~/Library/Application Support/adb-battery-widget/settings.json`
- Linux: `~/.config/adb-battery-widget/settings.json`

## 🔧 故障排除

### 常见问题

**Q: 悬浮窗显示"未连接"**

- 检查设备是否已启用 USB 调试
- 确认 ADB 服务是否正常运行
- 尝试在设置中切换连接模式

**Q: 设置保存失败**

- 检查应用是否有写入配置文件的权限
- 重启应用后重试

**Q: 托盘图标不显示**

- 检查系统托盘区域是否被隐藏
- 重启应用

### 调试模式

开发模式下会自动打开 DevTools，可以查看：

- 主进程日志：ADB 连接状态
- 渲染进程日志：UI 交互和错误

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
