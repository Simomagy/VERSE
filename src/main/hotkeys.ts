import { globalShortcut, app } from 'electron'
import { exec } from 'child_process'
import { toggleMainWindow, toggleOverlayMode } from './window'
import Store from 'electron-store'

const STAR_CITIZEN_PROCESS = 'StarCitizen.exe'
const OVERLAY_HOTKEY = 'F3'

function isStarCitizenRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    exec(
      `tasklist /FI "IMAGENAME eq ${STAR_CITIZEN_PROCESS}" /NH`,
      (_error, stdout) => {
        // resolve(stdout.toLowerCase().includes(STAR_CITIZEN_PROCESS.toLowerCase()))
        resolve(true)
      }
    )
  })
}

interface StoreSchema {
  hotkey: string
}

const store = new Store<StoreSchema>({
  defaults: {
    hotkey: 'CommandOrControl+Shift+V'
  }
})

let currentHotkey: string | null = null

export function registerGlobalHotkey(): boolean {
  const hotkey = store.get('hotkey', 'CommandOrControl+Shift+V')

  if (currentHotkey) {
    globalShortcut.unregister(currentHotkey)
  }

  try {
    const success = globalShortcut.register(hotkey, () => {
      toggleMainWindow()
    })

    if (success) {
      currentHotkey = hotkey
      console.log(`Global hotkey registered: ${hotkey}`)
      return true
    } else {
      console.error(`Failed to register global hotkey: ${hotkey}`)
      return false
    }
  } catch (error) {
    console.error('Error registering global hotkey:', error)
    return false
  }
}

export function unregisterGlobalHotkey(): void {
  if (currentHotkey) {
    globalShortcut.unregister(currentHotkey)
    currentHotkey = null
  }
}

export function updateGlobalHotkey(newHotkey: string): boolean {
  store.set('hotkey', newHotkey)
  return registerGlobalHotkey()
}

export function getConfiguredHotkey(): string {
  return store.get('hotkey', 'CommandOrControl+Shift+V')
}

export function registerOverlayHotkey(): void {
  const success = globalShortcut.register(OVERLAY_HOTKEY, async () => {
    console.log('[overlay] F3 pressed')
    const running = await isStarCitizenRunning()
    console.log('[overlay] Star Citizen running:', running)
    if (running) {
      toggleOverlayMode()
    }
  })
  console.log(`[overlay] F3 registration ${success ? 'OK' : 'FAILED'}`)
}

export function unregisterOverlayHotkey(): void {
  globalShortcut.unregister(OVERLAY_HOTKEY)
}

export function initHotkeys(): void {
  registerGlobalHotkey()
  registerOverlayHotkey()

  app.on('will-quit', () => {
    globalShortcut.unregisterAll()
  })
}
