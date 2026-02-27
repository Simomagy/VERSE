import { create } from 'zustand'
import { uexClient } from '../api/uex.client'

interface AuthState {
  appToken: string
  isAppTokenSet: boolean
  isLoading: boolean
  error: string | null

  loadTokens: () => Promise<void>
  setAppToken: (token: string) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>(() => ({
  appToken: '',
  isAppTokenSet: false,
  isLoading: false,
  error: null,

  loadTokens: async () => {
    useAuthStore.setState({ isLoading: true, error: null })
    try {
      const appToken = await window.api.token.getAppToken()
      if (appToken) await uexClient.setAppToken(appToken)
      useAuthStore.setState({ appToken, isAppTokenSet: !!appToken, isLoading: false })
    } catch (error) {
      useAuthStore.setState({
        error: error instanceof Error ? error.message : 'Failed to load tokens',
        isLoading: false
      })
    }
  },

  setAppToken: async (token: string) => {
    useAuthStore.setState({ isLoading: true, error: null })
    try {
      await uexClient.setAppToken(token)
      await uexClient.reloadTokens()
      useAuthStore.setState({ appToken: token, isAppTokenSet: !!token, isLoading: false })
    } catch (error) {
      useAuthStore.setState({
        error: error instanceof Error ? error.message : 'Failed to set app token',
        isLoading: false
      })
      throw error
    }
  },

  clearError: () => useAuthStore.setState({ error: null })
}))
