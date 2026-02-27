import { create } from 'zustand'

interface UIState {
  sidebarCollapsed: boolean
  currentView: string
  isOnline: boolean
  rateLimitRemaining: number

  // Actions
  toggleSidebar: () => void
  setCurrentView: (view: string) => void
  setOnlineStatus: (status: boolean) => void
  setRateLimitRemaining: (remaining: number) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  currentView: 'market',
  isOnline: true,
  rateLimitRemaining: 60,

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setCurrentView: (view: string) => set({ currentView: view }),

  setOnlineStatus: (status: boolean) => set({ isOnline: status }),

  setRateLimitRemaining: (remaining: number) => set({ rateLimitRemaining: remaining })
}))
