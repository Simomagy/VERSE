# Changelog

All notable changes to VERSE will be documented in this file.

## [1.0.0] - 2026-02-23

### Initial Release

#### Features

- **Market View**
  - Real-time commodity prices from UEX API
  - Top 30 best trade routes with profit calculations
  - Search and filter commodities
  - Automatic data caching (5-minute stale time)

- **Fleet Management**
  - View personal vehicle collection
  - Vehicle details and metadata
  - Organization integration
  - Pledge status tracking

- **Trade History**
  - Personal trading log
  - Profit/loss tracking
  - Trade statistics dashboard
  - Average margin calculations

- **Statistics & Reports**
  - Community-sourced best routes
  - Latest datarunner reports
  - Aggregated market data
  - Hourly data updates

- **Settings**
  - Secure API token storage (encrypted)
  - Customizable global hotkey
  - App preferences (minimize to tray, notifications)
  - Token management

#### Technical

- Electron 39.2.6 with React 19.2.1
- TypeScript for type safety
- TanStack Query for efficient data fetching
- Automatic rate limiting (60 req/min)
- System tray integration
- Frameless window design
- Dark sci-fi theme
- Windows support (primary)

#### Security

- Encrypted token storage via Electron safeStorage
- Context isolation enabled
- Sandboxed renderer process
- No eval or remote code execution

---

## Roadmap

See README.md for upcoming features.
