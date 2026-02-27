import { ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import { getMainWindow } from './window'

const CHECK_DELAY_MS = 10_000 // attende 10s dopo il boot prima del primo check

export function setupAutoUpdater(): void {
  autoUpdater.autoDownload = true // download silenzioso in background
  autoUpdater.autoInstallOnAppQuit = true // installa automaticamente alla chiusura

  autoUpdater.on('update-available', (info) => {
    console.log(`[AutoUpdater] Update available: v${info.version}`)
    getMainWindow()?.webContents.send('updater:update-available', { version: info.version })
  })

  autoUpdater.on('update-downloaded', (info) => {
    console.log(`[AutoUpdater] Update downloaded: v${info.version}`)
    getMainWindow()?.webContents.send('updater:update-downloaded', { version: info.version })
  })

  autoUpdater.on('error', (err) => {
    // In dev mode il check fallisce per via dell'assenza del certificato: è normale.
    console.error('[AutoUpdater] Error:', err?.message ?? err)
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
