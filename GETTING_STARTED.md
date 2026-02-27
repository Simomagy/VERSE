# Getting Started with VERSE

## Quick Start Guide

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Electron, React, TypeScript
- TanStack Query, Zustand, Axios
- Tailwind CSS, shadcn/ui components
- electron-store for persistent storage

### 2. Get Your UEX API Token

1. Visit [UEX Corp My Apps](https://uexcorp.space/api/my-apps)
2. Sign in or create an account
3. Create a new application
4. Copy your API token (you'll need this in step 4)

### 3. Run Development Server

```bash
npm run dev
```

This will:
- Start Vite dev server for hot reload
- Launch Electron window
- Enable React DevTools

### 4. Configure VERSE

On first launch:
1. Click the **Settings** icon (gear) in the sidebar
2. Paste your UEX API token in the "Application Token" field
3. Click **Save**
4. (Optional) Add your personal token for fleet/trade access

### 5. Explore Features

Navigate through the sidebar:
- **Market**: View commodity prices and best trade routes
- **Fleet**: Manage your vehicles (requires personal token)
- **Trades**: Track your trading history (requires personal token)
- **Stats**: Community data and reports
- **Settings**: Configure tokens and preferences

## Development Tips

### Hot Reload

The renderer (React) supports hot reload. Changes to UI components will reflect immediately.

Main process changes require restart:
```bash
# Stop dev server (Ctrl+C)
npm run dev
```

### Global Hotkey

Default: `Ctrl+Shift+V`

Test show/hide functionality by:
1. Running the app
2. Pressing the hotkey to hide
3. Pressing again to show

### Testing API Integration

1. Open DevTools: `Ctrl+Shift+I` (Windows) or `Cmd+Option+I` (Mac)
2. Go to Console tab
3. Look for `[UEX]` log messages showing API calls
4. Check Network tab for API responses

### System Tray

The app minimizes to system tray by default:
1. Close the window (X button)
2. Look for VERSE icon in system tray
3. Right-click for menu
4. Left-click to restore window

## Project Structure

```
VERSE/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Entry point
│   │   ├── window.ts      # Window management
│   │   ├── tray.ts        # System tray
│   │   ├── hotkeys.ts     # Global shortcuts
│   │   └── ipc.ts         # IPC handlers
│   │
│   ├── preload/           # Preload scripts
│   │   ├── index.ts       # Context bridge
│   │   └── index.d.ts     # TypeScript types
│   │
│   └── renderer/          # React app
│       ├── api/           # API layer
│       │   ├── uex.client.ts      # Axios client
│       │   ├── types.ts           # TypeScript types
│       │   ├── market.service.ts  # Market API
│       │   ├── fleet.service.ts   # Fleet API
│       │   ├── trades.service.ts  # Trades API
│       │   └── data.service.ts    # Stats API
│       │
│       ├── components/    # UI components
│       │   ├── ui/        # shadcn/ui components
│       │   └── layout/    # Layout components
│       │
│       ├── hooks/         # Custom React hooks
│       │   ├── useMarket.ts
│       │   ├── useFleet.ts
│       │   ├── useTrades.ts
│       │   └── useData.ts
│       │
│       ├── stores/        # Zustand stores
│       │   ├── auth.store.ts
│       │   ├── settings.store.ts
│       │   └── ui.store.ts
│       │
│       ├── views/         # Page components
│       │   ├── MarketView.tsx
│       │   ├── FleetView.tsx
│       │   ├── TradesView.tsx
│       │   ├── StatsView.tsx
│       │   └── SettingsView.tsx
│       │
│       └── lib/           # Utilities
│           └── utils.ts
│
├── resources/             # App icons and assets
├── build/                 # Build resources
└── dist/                  # Build output
```

## Common Issues

### Port Already in Use

If you see "Port 5173 is already in use":
```bash
# Kill the process using the port
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5173 | xargs kill -9
```

### Token Not Saving

If your token doesn't persist:
1. Check console for errors
2. Verify electron-store permissions
3. Try deleting app data:
   - Windows: `%APPDATA%\verse`
   - Mac: `~/Library/Application Support/verse`

### API Rate Limit

If you hit rate limits:
- Wait 1 minute (60 req/min limit)
- Check console for remaining requests
- TanStack Query caches data automatically

### Hotkey Not Working

If global hotkey doesn't register:
1. Check if another app uses the same combination
2. Try a different hotkey in Settings
3. Restart the app after changing hotkey

## Building for Production

```bash
# Windows
npm run build:win

# Output in dist/ folder
```

The built app will:
- Be a standalone executable
- Include all dependencies
- Not require Node.js
- Auto-update capable (if configured)

## Next Steps

- Read [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- Check [CHANGELOG.md](CHANGELOG.md) for version history
- Visit [UEX Corp Docs](https://uexcorp.space/api/documentation/) for API details

## Need Help?

- Check [README.md](README.md) for overview
- Open an issue on GitHub
- Join Star Citizen trading communities

---

Happy trading, Citizen! o7
