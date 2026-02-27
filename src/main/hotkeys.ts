import { globalShortcut, app } from 'electron'
import { toggleMainWindow } from './window'
import Store from 'electron-store'

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

export function initHotkeys(): void {
  registerGlobalHotkey()

  app.on('will-quit', () => {
    globalShortcut.unregisterAll()
  })
}
