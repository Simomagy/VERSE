import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const windowAPI = {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  show: () => ipcRenderer.send('window:show'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized') as Promise<boolean>
}

const tokenAPI = {
  setAppToken: (token: string) => ipcRenderer.invoke('token:set-app', token),
  getAppToken: () => ipcRenderer.invoke('token:get-app'),
  setUserToken: (token: string) => ipcRenderer.invoke('token:set-user', token),
  getUserToken: () => ipcRenderer.invoke('token:get-user')
}

const settingsAPI = {
  get: () => ipcRenderer.invoke('settings:get'),
  set: (settings: any) => ipcRenderer.invoke('settings:set', settings),
  setHotkey: (hotkey: string) => ipcRenderer.invoke('settings:set-hotkey', hotkey)
}

const fleetAPI = {
  getAll: () => ipcRenderer.invoke('fleet:get-all'),
  add: (ship: any) => ipcRenderer.invoke('fleet:add', ship),
  update: (ship: any) => ipcRenderer.invoke('fleet:update', ship),
  remove: (id: string) => ipcRenderer.invoke('fleet:remove', id)
}

const tradesAPI = {
  getAll: () => ipcRenderer.invoke('trades:get-all'),
  add: (trade: any) => ipcRenderer.invoke('trades:add', trade),
  update: (trade: any) => ipcRenderer.invoke('trades:update', trade),
  remove: (id: string) => ipcRenderer.invoke('trades:remove', id)
}

const refineryJobsAPI = {
  getAll: () => ipcRenderer.invoke('refineryJobs:get-all'),
  add: (job: any) => ipcRenderer.invoke('refineryJobs:add', job),
  update: (job: any) => ipcRenderer.invoke('refineryJobs:update', job),
  remove: (id: string) => ipcRenderer.invoke('refineryJobs:remove', id)
}

const walletAPI = {
  getAll: () => ipcRenderer.invoke('wallet:get-all'),
  add: (entry: any) => ipcRenderer.invoke('wallet:add', entry),
  update: (entry: any) => ipcRenderer.invoke('wallet:update', entry),
  remove: (id: string) => ipcRenderer.invoke('wallet:remove', id)
}

const imageCacheAPI = {
  get: (normalizedName: string) =>
    ipcRenderer.invoke('imageCache:get', normalizedName) as Promise<string | null>,
  set: (normalizedName: string, url: string) =>
    ipcRenderer.invoke('imageCache:set', normalizedName, url) as Promise<{ success: boolean }>,
  clear: () => ipcRenderer.invoke('imageCache:clear') as Promise<{ success: boolean }>
}

const appAPI = {
  version: () => ipcRenderer.invoke('app:version') as Promise<string>,
  checkApis: () => ipcRenderer.invoke('app:check-apis') as Promise<{ uex: boolean; wiki: boolean }>
}

const updaterAPI = {
  onUpdateAvailable: (cb: (info: { version: string }) => void) =>
    ipcRenderer.on('updater:update-available', (_evt, info) => cb(info)),
  onUpdateDownloaded: (cb: (info: { version: string }) => void) =>
    ipcRenderer.on('updater:update-downloaded', (_evt, info) => cb(info)),
  install: () => ipcRenderer.send('updater:install')
}

const api = {
  window: windowAPI,
  token: tokenAPI,
  settings: settingsAPI,
  app: appAPI,
  updater: updaterAPI,
  fleet: fleetAPI,
  trades: tradesAPI,
  refineryJobs: refineryJobsAPI,
  wallet: walletAPI,
  imageCache: imageCacheAPI
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('Failed to expose APIs:', error)
  }
} else {
  // @ts-ignore: contextBridge not available outside sandbox — direct assignment fallback
  window.electron = electronAPI
  // @ts-ignore: contextBridge not available outside sandbox — direct assignment fallback
  window.api = api
}
