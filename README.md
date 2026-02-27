# VERSE - UEX Corp Companion App

> Desktop companion app for Star Citizen traders, powered by UEX Corp API 2.0

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Electron](https://img.shields.io/badge/Electron-39.2.6-47848f?logo=electron)
![React](https://img.shields.io/badge/React-19.2.1-61dafb?logo=react)

## Features

- **Market Data**: Real-time commodity prices and best trade routes
- **Fleet Management**: Track your personal vehicle collection
- **Trade History**: Log and analyze your trading activities
- **Community Stats**: Access aggregated data from UEX community
- **System Tray**: Minimalist overlay accessible via global hotkey
- **Secure Storage**: Encrypted token storage using Electron safeStorage

## Screenshots

*Coming soon*

## Installation

### Prerequisites

- Node.js 18+ and npm
- Windows 10/11 (primary target platform)

### Setup

1. Clone the repository
```bash
git clone <repository-url>
cd VERSE
```

2. Install dependencies
```bash
npm install
```

3. Get your UEX API token
   - Visit [UEX My Apps](https://uexcorp.space/api/my-apps)
   - Create a new application
   - Copy your API token

4. Run in development mode
```bash
npm run dev
```

## Building

```bash
# Build for Windows
npm run build:win

# Build without packaging (faster)
npm run build:unpack
```

## Usage

### First Launch

1. Launch VERSE
2. Go to Settings (gear icon in sidebar)
3. Enter your UEX API token
4. (Optional) Add your personal token for fleet and trade history access

### Global Hotkey

Default: `Ctrl+Shift+V` (Windows) / `Cmd+Shift+V` (Mac)

Press the hotkey anytime to show/hide the VERSE overlay.

### System Tray

VERSE runs in the system tray. Right-click the tray icon to:
- Open the app
- Access settings
- Quit the application

## Tech Stack

- **Electron** - Desktop framework
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TanStack Query** - Data fetching & caching
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **electron-store** - Persistent storage
- **axios** - HTTP client

## Architecture

```
VERSE/
├── src/
│   ├── main/          # Electron main process
│   │   ├── index.ts   # Entry point
│   │   ├── window.ts  # Window management
│   │   ├── tray.ts    # System tray
│   │   ├── hotkeys.ts # Global shortcuts
│   │   └── ipc.ts     # IPC handlers
│   ├── preload/       # Preload scripts
│   │   └── index.ts   # Context bridge
│   └── renderer/      # React application
│       ├── api/       # API clients & services
│       ├── components/# UI components
│       ├── hooks/     # Custom React hooks
│       ├── stores/    # Zustand stores
│       ├── views/     # Page components
│       └── lib/       # Utilities
```

## API Rate Limiting

UEX API allows:
- 86,400 requests per day
- 60 requests per minute

VERSE implements automatic rate limiting and intelligent caching to stay within these limits.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - See LICENSE file for details

## Acknowledgments

- [UEX Corp](https://uexcorp.space) for providing the API
- Star Citizen community for data contributions
- Cloud Imperium Games for Star Citizen

## Support

For issues and feature requests, please use the [GitHub Issues](issues) page.

## Roadmap

- [ ] Auto-update support
- [ ] Custom themes
- [ ] Trade route calculator
- [ ] Price alerts & notifications
- [ ] Multi-language support
- [ ] macOS & Linux builds

---

**Disclaimer**: This is a fan-made tool and is not affiliated with Cloud Imperium Games or UEX Corp.
