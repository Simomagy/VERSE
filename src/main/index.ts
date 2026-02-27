import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createMainWindow } from './window'
import { createSystemTray, destroyTray } from './tray'
import { initHotkeys, unregisterGlobalHotkey } from './hotkeys'
import { setupIpcHandlers } from './ipc'
import { setupCorsHeaders } from './cors'

// Previeni istanze multiple
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const window = BrowserWindow.getAllWindows()[0]
    if (window) {
      if (window.isMinimized()) window.restore()
      window.focus()
    }
  })

  app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.verse.uex')

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // Patch CORS headers per le chiamate API UEX dal renderer
    setupCorsHeaders()

    // Setup IPC handlers
    setupIpcHandlers()

    // Create system tray
    createSystemTray()

    // Register global hotkeys
    initHotkeys()

    // Create main window
    createMainWindow()

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
      }
    })
  })

  // Non chiudere l'app quando tutte le finestre sono chiuse (system tray)
  app.on('window-all-closed', () => {
    // Non fare nulla, l'app rimane in tray
  })

  app.on('before-quit', () => {
    unregisterGlobalHotkey()
    destroyTray()
  })
}
