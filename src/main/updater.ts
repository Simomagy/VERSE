import { ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import { getMainWindow } from './window'

const CHECK_DELAY_MS = 10_000 // attende 10s dopo il boot prima del primo check

export function setupAutoUpdater(): void {
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    console.log('[AutoUpdater] Checking for updates...')
  })

  autoUpdater.on('update-available', (info) => {
    console.log(`[AutoUpdater] Update available: v${info.version}`)
    getMainWindow()?.webContents.send('updater:update-available', { version: info.version })
  })

  autoUpdater.on('update-not-available', (info) => {
    console.log(`[AutoUpdater] Already up to date (remote: v${info.version})`)
  })

  autoUpdater.on('download-progress', (progress) => {
    console.log(`[AutoUpdater] Downloading: ${Math.round(progress.percent)}%`)
    getMainWindow()?.webContents.send('updater:download-progress', {
      percent: progress.percent,
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    console.log(`[AutoUpdater] Update downloaded: v${info.version}`)
    getMainWindow()?.webContents.send('updater:update-downloaded', { version: info.version })
  })

  autoUpdater.on('error', (err) => {
    // In dev mode il check fallisce per via dell'assenza del file locale: è normale.
    console.error('[AutoUpdater] Error:', err?.message ?? err)
    getMainWindow()?.webContents.send('updater:error', { message: err?.message ?? String(err) })
  })

  ipcMain.on('updater:install', () => {
    autoUpdater.quitAndInstall(false, true)
  })

  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      console.error('[AutoUpdater] checkForUpdates failed:', err?.message ?? err)
    })
  }, CHECK_DELAY_MS)
}
