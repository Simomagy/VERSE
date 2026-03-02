# VERSE

VERSE is a Windows desktop companion for Star Citizen traders and miners. It connects to the [UEX Corp API 2.0](https://uexcorp.space) for live market data and stores all personal records locally using encrypted storage.

Built with Electron, React, and TypeScript.

---

## Features

**Trade Log**
Record buy and sell runs with multiple commodities per run. UEX terminal prices are auto-filled based on location and commodity. A matching sell run can be created from any existing buy run in one click.

**Refinery Log**
Track refinery jobs with per-mineral input/output breakdown, yield percentages, and refining cost. Each job shows a live countdown timer. Sell trades can be created directly from one or multiple refinery jobs.

**Fleet Registry**
Manage your personal fleet. Ship data (manufacturer, role, cargo capacity) is sourced from the Star Citizen Wiki API. Custom nicknames are supported.

**Wallet**
Record income, expenses, and balance adjustments. The current balance is always visible in the top bar. Trade runs automatically register their buy/sell amounts as wallet entries.

**Equipment**
Browse, realtime prices and locations about FPS Armors, Weapons, Clothings and Ship Upgrades

**Auto-Update**
The app checks GitHub Releases in the background on startup. When a new version is downloaded, a notification appears in the status bar. Clicking it installs the update and restarts the app.

---

## Requirements

- Windows 10 or 11
- Node.js 20+ and npm (for development)
- A [UEX Corp API token](https://uexcorp.space/api/my-apps) (requested on first launch)

---

## Development Setup

```bash
git clone https://github.com/Simomagy/VERSE.git
cd VERSE
npm install
npm run dev
```

The first launch will prompt for your UEX Bearer token. This can also be configured later in Settings.

---

## Building

```bash
# Build installer for Windows (no publish)
npm run build:win

# Build and publish to GitHub Releases
npm run build:release

# Quick build without packaging
npm run build:unpack
```

### App Icon

Place your icon files in the `build/` directory before packaging:

- `build/icon.ico` — Windows taskbar and installer icon (256x256 minimum)
- `build/icon.png` — Fallback (512x512)

---

## Releasing

Releases are automated via GitHub Actions. To publish a new version:

1. Update `version` in `package.json`
2. Commit and tag the release:

```bash
git tag v1.1.0
git push origin v1.1.0
```

The workflow builds a Windows NSIS installer and publishes it to GitHub Releases. Existing installations will detect the update automatically within 10 seconds of the next app launch.

### Required GitHub Secret

In `Settings > Secrets and variables > Actions`, add:

- `GH_TOKEN` — Personal Access Token with `repo` scope

---

## Architecture

```
src/
  main/           Electron main process
    index.ts      Entry point and app lifecycle
    window.ts     BrowserWindow setup (frameless, custom title bar)
    ipc.ts        All IPC handlers (fleet, trades, refineries, wallet, app)
    updater.ts    Auto-updater (electron-updater, silent download)
    tray.ts       System tray
    hotkeys.ts    Global shortcut registration
    cors.ts       CORS header patching for UEX API calls
  preload/
    index.ts      Context bridge — exposes window.api to renderer
  renderer/
    api/          UEX API client, SC Wiki client, type definitions
    components/   Layout (TitleBar, Sidebar, StatusBar, BootScreen) and UI primitives
    hooks/        TanStack Query hooks for local data and UEX prices
    stores/       Zustand stores (auth, settings, static data)
    views/        TradesView, RefineriesView, FleetView, WalletView, SettingsView
    lib/          Utility functions (formatting, animations, abbreviations)
```

---

## Data Sources

| Data                                 | Source                                 |
| ------------------------------------ | -------------------------------------- |
| Commodity prices                     | UEX Corp API `/commodities_prices_all` |
| Space stations, cities, outposts     | UEX Corp API (filtered by star system) |
| Refinery methods                     | UEX Corp API `/refinery_methods`       |
| Ships                                | Star Citizen Wiki API `/vehicles`      |
| Star systems and locations           | Star Citizen Wiki API                  |
| Fleet, trades, refinery jobs, wallet | Local (electron-store, encrypted)      |

**UEX API limits:** 14,400 requests/day — 10 requests/minute. VERSE caches all static data at startup and uses a 5-minute stale time for price data to stay well within limits.

---

## Tech Stack

- Electron 39 — desktop shell, IPC, secure storage
- React 19 + TypeScript — renderer UI
- electron-vite — build toolchain
- Tailwind CSS — styling (custom HUD/cockpit theme)
- TanStack Query — data fetching and caching
- Zustand — global state
- electron-store — local persistent storage
- electron-updater — auto-update from GitHub Releases
- Framer Motion — UI animations
- Axios — HTTP client
- lucide-react — icons

---

## Disclaimer

VERSE is a fan-made tool and is not affiliated with Cloud Imperium Games or UEX Corp.
