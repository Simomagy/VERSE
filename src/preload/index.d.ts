import { ElectronAPI } from '@electron-toolkit/preload'

interface WindowAPI {
  minimize:    () => void
  maximize:    () => void
  close:       () => void
  show:        () => void
  isMaximized: () => Promise<boolean>
}

interface TokenAPI {
  setAppToken: (token: string) => Promise<{ success: boolean; error?: string }>
  getAppToken: () => Promise<string>
  setUserToken: (token: string) => Promise<{ success: boolean; error?: string }>
  getUserToken: () => Promise<string>
}

interface SettingsData {
  autoStart: boolean
  minimizeToTray: boolean
  notifications: boolean
  hotkey: string
}

interface SettingsAPI {
  get: () => Promise<SettingsData>
  set: (settings: Partial<Omit<SettingsData, 'hotkey'>>) => Promise<{ success: boolean; error?: string }>
  setHotkey: (hotkey: string) => Promise<{ success: boolean }>
}

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

interface FleetAPI {
  getAll: () => Promise<LocalShip[]>
  add:    (ship: Omit<LocalShip, 'id' | 'dateAdded'>) => Promise<LocalShip>
  update: (ship: LocalShip) => Promise<LocalShip>
  remove: (id: string) => Promise<{ success: boolean }>
}

interface RefineryMineral {
  mineral: string
  scuInput: number
  yieldPercent: number
  scuOutput: number
  pricePerScu: number
  estimatedValue: number
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

interface TradesAPI {
  getAll: () => Promise<LocalTrade[]>
  add: (trade: Omit<LocalTrade, 'id' | 'dateAdded'>) => Promise<LocalTrade>
  update: (trade: LocalTrade) => Promise<LocalTrade>
  remove: (id: string) => Promise<{ success: boolean }>
}

interface RefineryJobsAPI {
  getAll: () => Promise<LocalRefineryJob[]>
  add: (job: Omit<LocalRefineryJob, 'id' | 'dateAdded'>) => Promise<LocalRefineryJob>
  update: (job: LocalRefineryJob) => Promise<LocalRefineryJob>
  remove: (id: string) => Promise<{ success: boolean }>
}

interface LocalWalletEntry {
  id: string
  type: 'income' | 'expense' | 'adjustment'
  amount: number
  description: string
  category: string
  dateAdded: number
  sourceId?: string   // voci generate automaticamente da un trade
}

interface WalletAPI {
  getAll: () => Promise<LocalWalletEntry[]>
  add: (entry: Omit<LocalWalletEntry, 'id' | 'dateAdded'>) => Promise<LocalWalletEntry>
  update: (entry: LocalWalletEntry) => Promise<LocalWalletEntry>
  remove: (id: string) => Promise<{ success: boolean }>
}

interface AppAPI {
  version:   () => Promise<string>
  checkApis: () => Promise<{ uex: boolean; wiki: boolean }>
}

interface API {
  window: WindowAPI
  token: TokenAPI
  settings: SettingsAPI
  app: AppAPI
  fleet: FleetAPI
  trades: TradesAPI
  refineryJobs: RefineryJobsAPI
  wallet: WalletAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
