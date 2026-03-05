import { BrowserWindow, shell, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

const NORMAL_WINDOW_SIZE = { width: 1400, height: 800 }

let mainWindow: BrowserWindow | null = null
let isOverlayMode = false
let savedBounds: Electron.Rectangle | null = null

export function createMainWindow(): BrowserWindow {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
    return mainWindow
  }

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    frame: false,
    transparent: true,
    resizable: true,
    autoHideMenuBar: true,
    skipTaskbar: false,
    title: 'V.E.R.S.E.',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      // CORS è irrilevante per un'app desktop controllata
      // che non carica contenuto web esterno non trusted
      webSecurity: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

export function toggleMainWindow(): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createMainWindow()
  } else if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    mainWindow.show()
    mainWindow.focus()
  }
}

export function showMainWindow(): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createMainWindow()
  } else {
    mainWindow.show()
    mainWindow.focus()
  }
}

export function hideMainWindow(): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide()
  }
}

export function closeMainWindow(): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close()
    mainWindow = null
  }
}

export function toggleOverlayMode(): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    console.log('[overlay] toggleOverlayMode: mainWindow not available')
    return
  }

  if (isOverlayMode) {
    console.log('[overlay] exiting overlay mode')
    isOverlayMode = false
    mainWindow.setAlwaysOnTop(false)
    mainWindow.setSkipTaskbar(false)

    const bounds = savedBounds ?? {
      ...NORMAL_WINDOW_SIZE,
      x: 0,
      y: 0
    }
    mainWindow.setBounds(bounds)
    savedBounds = null

    mainWindow.webContents.send('overlay:mode-changed', false)
  } else {
    console.log('[overlay] entering overlay mode')
    savedBounds = mainWindow.getBounds()
    isOverlayMode = true

    const display = screen.getPrimaryDisplay()
    console.log('[overlay] display bounds:', display.bounds)
    mainWindow.setAlwaysOnTop(true, 'screen-saver')
    mainWindow.setSkipTaskbar(true)
    mainWindow.setBounds(display.bounds)
    mainWindow.focus()

    mainWindow.webContents.send('overlay:mode-changed', true)
    console.log('[overlay] IPC sent: overlay:mode-changed true')
  }
}

export function getOverlayMode(): boolean {
  return isOverlayMode
}
