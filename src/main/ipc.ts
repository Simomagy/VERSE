import { ipcMain, safeStorage, app } from 'electron'
import Store from 'electron-store'
import { randomUUID } from 'crypto'
import { getMainWindow, hideMainWindow, closeMainWindow, showMainWindow } from './window'
import { updateGlobalHotkey, getConfiguredHotkey } from './hotkeys'

interface LocalShip {
  id: string
  nickname: string
  wikiSlug: string
  wikiName: string
  manufacturer: string
  role: string
  size: string
  cargoCapacity: number
  dateAdded: number
}

interface TradeItem {
  commodity: string
  operation: 'buy' | 'sell'
  scu: number
  pricePerScu: number
  totalPrice: number
}

interface LocalTrade {
  id: string
  shipId: string | null
  shipName: string
  locationFrom: string
  locationTo: string
  items: TradeItem[]
  totalBuy: number
  totalSell: number
  netProfit: number
  notes: string
  dateAdded: number
}

interface RefineryMineral {
  mineral: string
  scuInput: number
  yieldPercent: number
  scuOutput: number
  pricePerScu: number
  estimatedValue: number
}

interface LocalWalletEntry {
  id: string
  type: 'income' | 'expense' | 'adjustment'
  amount: number
  description: string
  category: string
  dateAdded: number
  sourceId?: string // presente solo sulle voci generate automaticamente da un trade
}

interface LocalRefineryJob {
  id: string
  refinery: string
  method: string
  methodCode: string
  minerals: RefineryMineral[]
  totalEstimatedValue: number
  refineCost: number
  netProfit: number
  refineDurationMinutes: number
  notes: string
  dateAdded: number
}

interface StoreSchema {
  appToken: string
  userToken: string
  hotkey: string
  settings: {
    autoStart: boolean
    minimizeToTray: boolean
    notifications: boolean
  }
  fleet: LocalShip[]
  trades: LocalTrade[]
  refineryJobs: LocalRefineryJob[]
  wallet: LocalWalletEntry[]
  imageCache: Record<string, string>
}

const store = new Store<StoreSchema>({
  defaults: {
    appToken: '',
    userToken: '',
    hotkey: 'CommandOrControl+Shift+V',
    settings: {
      autoStart: false,
      minimizeToTray: true,
      notifications: true
    },
    fleet: [],
    trades: [],
    refineryJobs: [],
    wallet: [],
    imageCache: {}
  }
})

export function setupIpcHandlers(): void {
  // Window controls
  ipcMain.on('window:minimize', () => {
    const window = getMainWindow()
    window?.minimize()
  })

  ipcMain.on('window:maximize', () => {
    const window = getMainWindow()
    if (window?.isMaximized()) {
      window.unmaximize()
    } else {
      window?.maximize()
    }
  })

  ipcMain.handle('window:is-maximized', () => {
    return getMainWindow()?.isMaximized() ?? false
  })

  // ─── App info ─────────────────────────────────────────────────────────

  ipcMain.handle('app:version', () => app.getVersion())

  ipcMain.handle('app:check-apis', async () => {
    // Qualsiasi risposta HTTP (anche 401/403/404) = server raggiungibile.
    // Solo errori di rete (timeout, DNS fail) = offline.
    const ping = async (url: string): Promise<boolean> => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 6000)
      try {
        const res = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: { Accept: 'application/json' }
        })
        return res.status < 500
      } catch {
        return false
      } finally {
        clearTimeout(timeout)
      }
    }

    const [uex, wiki] = await Promise.all([
      ping('https://uexcorp.space/2.0/commodities'),
      ping('https://api.star-citizen.wiki/api/v2/vehicles?limit=1')
    ])

    return { uex, wiki }
  })

  ipcMain.on('window:close', () => {
    const minimizeToTray = store.get('settings.minimizeToTray', true)
    if (minimizeToTray) {
      hideMainWindow()
    } else {
      closeMainWindow()
    }
  })

  ipcMain.on('window:show', () => {
    showMainWindow()
  })

  // Token management con safeStorage
  ipcMain.handle('token:set-app', async (_, token: string) => {
    try {
      if (safeStorage.isEncryptionAvailable()) {
        const encrypted = safeStorage.encryptString(token)
        store.set('appToken', encrypted.toString('base64'))
      } else {
        store.set('appToken', token)
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('token:get-app', async () => {
    try {
      const stored = store.get('appToken', '')
      if (!stored) return ''

      if (safeStorage.isEncryptionAvailable()) {
        const buffer = Buffer.from(stored, 'base64')
        return safeStorage.decryptString(buffer)
      }
      return stored
    } catch (error) {
      console.error('Error decrypting app token:', error)
      return ''
    }
  })

  ipcMain.handle('token:set-user', async (_, token: string) => {
    try {
      if (safeStorage.isEncryptionAvailable()) {
        const encrypted = safeStorage.encryptString(token)
        store.set('userToken', encrypted.toString('base64'))
      } else {
        store.set('userToken', token)
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('token:get-user', async () => {
    try {
      const stored = store.get('userToken', '')
      if (!stored) return ''

      if (safeStorage.isEncryptionAvailable()) {
        const buffer = Buffer.from(stored, 'base64')
        return safeStorage.decryptString(buffer)
      }
      return stored
    } catch (error) {
      console.error('Error decrypting user token:', error)
      return ''
    }
  })

  // Settings management
  ipcMain.handle('settings:get', async () => {
    return {
      ...store.get('settings'),
      hotkey: getConfiguredHotkey()
    }
  })

  ipcMain.handle('settings:set', async (_, settings: Partial<StoreSchema['settings']>) => {
    try {
      const current = store.get('settings')
      store.set('settings', { ...current, ...settings })
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('settings:set-hotkey', async (_, hotkey: string) => {
    try {
      const success = updateGlobalHotkey(hotkey)
      return { success }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // Store management generico
  ipcMain.handle('store:get', async (_, key: string) => {
    return store.get(key as any)
  })

  ipcMain.handle('store:set', async (_, key: string, value: any) => {
    try {
      store.set(key as any, value)
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // ─── Fleet (locale) ───────────────────────────────────────────────────

  ipcMain.handle('fleet:get-all', async () => {
    return store.get('fleet', [])
  })

  ipcMain.handle('fleet:add', async (_, ship: Omit<LocalShip, 'id' | 'dateAdded'>) => {
    const fleet = store.get('fleet', [])
    const newShip: LocalShip = {
      ...ship,
      id: randomUUID(),
      dateAdded: Date.now()
    }
    store.set('fleet', [...fleet, newShip])
    return newShip
  })

  ipcMain.handle('fleet:update', async (_, ship: LocalShip) => {
    const fleet = store.get('fleet', [])
    store.set(
      'fleet',
      fleet.map((s: LocalShip) => (s.id === ship.id ? ship : s))
    )
    return ship
  })

  ipcMain.handle('fleet:remove', async (_, id: string) => {
    const fleet = store.get('fleet', [])
    store.set(
      'fleet',
      fleet.filter((s: LocalShip) => s.id !== id)
    )
    return { success: true }
  })

  // ─── Trades (locale) ─────────────────────────────────────────────────

  // Sincronizza il wallet con le voci auto-generate da un trade.
  // Usa ID deterministici (trade-buy-<id>, trade-sell-<id>) per poter
  // fare upsert senza creare duplicati.
  function syncTradeWallet(trade: LocalTrade): void {
    const wallet = store.get('wallet', []) as LocalWalletEntry[]
    const label = trade.locationFrom + (trade.locationTo ? ` → ${trade.locationTo}` : '')

    const newEntries: LocalWalletEntry[] = []

    if (trade.totalBuy > 0) {
      newEntries.push({
        id: `trade-buy-${trade.id}`,
        type: 'expense',
        amount: trade.totalBuy,
        description: `Buy: ${label}`,
        category: 'Trading',
        dateAdded: trade.dateAdded,
        sourceId: trade.id
      })
    }

    if (trade.totalSell > 0) {
      newEntries.push({
        id: `trade-sell-${trade.id}`,
        type: 'income',
        amount: trade.totalSell,
        description: `Sell: ${label}`,
        category: 'Trading',
        dateAdded: trade.dateAdded,
        sourceId: trade.id
      })
    }

    // Rimuove le voci precedenti legate a questo trade e inserisce le nuove
    const cleaned = wallet.filter((e: LocalWalletEntry) => e.sourceId !== trade.id)
    store.set('wallet', [...cleaned, ...newEntries])
  }

  function removeTradeWallet(tradeId: string): void {
    const wallet = store.get('wallet', []) as LocalWalletEntry[]
    store.set(
      'wallet',
      wallet.filter((e: LocalWalletEntry) => e.sourceId !== tradeId)
    )
  }

  ipcMain.handle('trades:get-all', async () => {
    const trades = store.get('trades', []) as LocalTrade[]
    // Migrazione: i vecchi trade (formato pre-multi-item) non hanno il campo items
    return trades.map((t) => ({
      ...t,
      items: Array.isArray(t.items) ? t.items : [],
      totalBuy: t.totalBuy ?? 0,
      totalSell: t.totalSell ?? 0,
      netProfit: t.netProfit ?? 0
    }))
  })

  ipcMain.handle('trades:add', async (_, trade: Omit<LocalTrade, 'id' | 'dateAdded'>) => {
    const trades = store.get('trades', [])
    const newTrade: LocalTrade = {
      ...trade,
      id: randomUUID(),
      dateAdded: Date.now()
    }
    store.set('trades', [newTrade, ...trades])
    syncTradeWallet(newTrade)
    return newTrade
  })

  ipcMain.handle('trades:update', async (_, updated: LocalTrade) => {
    const trades = store.get('trades', []) as LocalTrade[]
    store.set(
      'trades',
      trades.map((t: LocalTrade) => (t.id === updated.id ? updated : t))
    )
    syncTradeWallet(updated)
    return updated
  })

  ipcMain.handle('trades:remove', async (_, id: string) => {
    const trades = store.get('trades', [])
    store.set(
      'trades',
      trades.filter((t: LocalTrade) => t.id !== id)
    )
    removeTradeWallet(id)
    return { success: true }
  })

  // ─── Refinery Jobs (locale) ───────────────────────────────────────────

  ipcMain.handle('refineryJobs:get-all', async () => {
    return store.get('refineryJobs', [])
  })

  ipcMain.handle('refineryJobs:add', async (_, job: Omit<LocalRefineryJob, 'id' | 'dateAdded'>) => {
    const jobs = store.get('refineryJobs', [])
    const newJob: LocalRefineryJob = {
      ...job,
      id: randomUUID(),
      dateAdded: Date.now()
    }
    store.set('refineryJobs', [newJob, ...jobs])
    return newJob
  })

  ipcMain.handle('refineryJobs:update', async (_, job: LocalRefineryJob) => {
    const jobs = store.get('refineryJobs', [])
    const updated = jobs.map((j: LocalRefineryJob) => (j.id === job.id ? job : j))
    store.set('refineryJobs', updated)
    return job
  })

  ipcMain.handle('refineryJobs:remove', async (_, id: string) => {
    const jobs = store.get('refineryJobs', [])
    store.set(
      'refineryJobs',
      jobs.filter((j: LocalRefineryJob) => j.id !== id)
    )
    return { success: true }
  })

  // ─── Wallet (locale) ──────────────────────────────────────────────────

  ipcMain.handle('wallet:get-all', async () => {
    return store.get('wallet', [])
  })

  ipcMain.handle('wallet:add', async (_, entry: Omit<LocalWalletEntry, 'id' | 'dateAdded'>) => {
    const wallet = store.get('wallet', [])
    const newEntry: LocalWalletEntry = {
      ...entry,
      id: randomUUID(),
      dateAdded: Date.now()
    }
    store.set('wallet', [newEntry, ...wallet])
    return newEntry
  })

  ipcMain.handle('wallet:update', async (_, entry: LocalWalletEntry) => {
    const wallet = store.get('wallet', []) as LocalWalletEntry[]
    store.set(
      'wallet',
      wallet.map((e: LocalWalletEntry) => (e.id === entry.id ? entry : e))
    )
    return entry
  })

  ipcMain.handle('wallet:remove', async (_, id: string) => {
    const wallet = store.get('wallet', [])
    store.set(
      'wallet',
      wallet.filter((e: LocalWalletEntry) => e.id !== id)
    )
    return { success: true }
  })

  // ─── Image cache (Wiki thumbnails) ────────────────────────────────────

  ipcMain.handle('imageCache:get', async (_, normalizedName: string) => {
    const cache = store.get('imageCache', {})
    const entry = cache[normalizedName]
    return entry !== undefined ? entry : null
  })

  ipcMain.handle('imageCache:set', async (_, normalizedName: string, url: string) => {
    const cache = store.get('imageCache', {})
    store.set('imageCache', { ...cache, [normalizedName]: url })
    return { success: true }
  })

  ipcMain.handle('imageCache:clear', async () => {
    store.set('imageCache', {})
    return { success: true }
  })
}
