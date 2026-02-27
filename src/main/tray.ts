import { Tray, Menu, app, nativeImage } from 'electron'
import { join } from 'path'
import { showMainWindow, closeMainWindow } from './window'

let tray: Tray | null = null

export function createSystemTray(): Tray {
  if (tray) return tray

  const iconPath = join(__dirname, '../../resources/icon.png')
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })

  tray = new Tray(icon)
  tray.setToolTip('VERSE - UEX Companion')

  updateTrayMenu()

  tray.on('click', () => {
    showMainWindow()
  })

  return tray
}

export function updateTrayMenu(): void {
  if (!tray) return

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'VERSE - UEX Companion',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Open',
      click: () => {
        showMainWindow()
      }
    },
    {
      label: 'Settings',
      click: () => {
        showMainWindow()
        // TODO: Navigate to settings route
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        closeMainWindow()
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy()
    tray = null
  }
}

export function getTray(): Tray | null {
  return tray
}
