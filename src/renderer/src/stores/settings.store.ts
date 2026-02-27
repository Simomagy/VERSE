import { create } from 'zustand'
import type { AppSettings } from '../api/types'

interface SettingsState extends AppSettings {
  isLoading: boolean
  error: string | null

  // Actions
  loadSettings: () => Promise<void>
  updateSettings: (settings: Partial<Omit<AppSettings, 'hotkey'>>) => Promise<void>
  updateHotkey: (hotkey: string) => Promise<boolean>
  clearError: () => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  // Default values
  autoStart: false,
  minimizeToTray: true,
  notifications: true,
  hotkey: 'CommandOrControl+Shift+V',
  isLoading: false,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null })
    try {
      const settings = await window.api.settings.get()
      set({
        ...settings,
        isLoading: false
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load settings',
        isLoading: false
      })
    }
  },

  updateSettings: async (settings) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.settings.set(settings)
      if (result.success) {
        set({
          ...settings,
          isLoading: false
        })
      } else {
        throw new Error(result.error || 'Failed to update settings')
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update settings',
        isLoading: false
      })
      throw error
    }
  },

  updateHotkey: async (hotkey: string) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.settings.setHotkey(hotkey)
      if (result.success) {
        set({
          hotkey,
          isLoading: false
        })
        return true
      } else {
        throw new Error('Failed to register hotkey')
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update hotkey',
        isLoading: false
      })
      return false
    }
  },

  clearError: () => set({ error: null })
}))
