import { useEffect, useState } from 'react'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { HashRouter } from 'react-router-dom'
import { AppRouter } from './router'
import { useAuthStore } from './stores/auth.store'
import { useSettingsStore } from './stores/settings.store'
import { useStaticDataStore } from './stores/static-data.store'
import { BootScreen } from './components/layout/BootScreen'
import { Onboarding } from './components/layout/Onboarding'
import { ErrorBoundary } from './components/ErrorBoundary'

const BOOT_LINGER_MS = 1500

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 1000 * 60 * 60, // 1 ora di default
      gcTime: 1000 * 60 * 60 * 24 // 24 ore di cache persistence
    }
  }
})

const persister = createSyncStoragePersister({
  storage: window.localStorage
})

// Le query IPC-locali vivono in electron-store: non vanno duplicate in localStorage.
// Escluderle riduce drasticamente il payload del restore al boot.
const LOCAL_QUERY_PREFIXES = new Set(['wallet', 'trades', 'fleet', 'refinery'])

function shouldDehydrateQuery(query: { queryKey: readonly unknown[] }): boolean {
  const first = query.queryKey[0] as string
  return !LOCAL_QUERY_PREFIXES.has(first)
}

function AppInit() {
  const loadTokens    = useAuthStore(state => state.loadTokens)
  const isAppTokenSet = useAuthStore(state => state.isAppTokenSet)
  const isLoading     = useAuthStore(state => state.isLoading)
  const loadSettings  = useSettingsStore(state => state.loadSettings)
  const staticStatus  = useStaticDataStore(state => state.status)

  const [bootDone,       setBootDone]       = useState(false)
  const [onboardingDone, setOnboardingDone] = useState(false)

  useEffect(() => {
    loadTokens()
    loadSettings()

    // Pre-fetch delle query locali così sono in cache prima che l'utente navighi
    queryClient.prefetchQuery({ queryKey: ['wallet', 'local'],   queryFn: () => window.api.wallet.getAll(),       staleTime: Infinity })
    queryClient.prefetchQuery({ queryKey: ['fleet', 'local'],    queryFn: () => window.api.fleet.getAll(),        staleTime: Infinity })
    queryClient.prefetchQuery({ queryKey: ['trades', 'local'],   queryFn: () => window.api.trades.getAll(),       staleTime: Infinity })
    queryClient.prefetchQuery({ queryKey: ['refinery', 'jobs'],  queryFn: () => window.api.refineryJobs.getAll(), staleTime: Infinity })
  }, [])

  useEffect(() => {
    if (staticStatus === 'ready' || staticStatus === 'error') {
      const timer = setTimeout(() => setBootDone(true), BOOT_LINGER_MS)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [staticStatus])

  // Onboarding: mostra solo dopo il boot, solo se il token non è impostato.
  // isLoading=false garantisce che loadTokens sia terminato.
  const showOnboarding = bootDone && !isLoading && !isAppTokenSet && !onboardingDone

  return (
    <>
      {/* App sempre montata — nessun unmount/remount al termine del boot */}
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>

      {/* Boot screen come overlay fisso sopra l'app */}
      {!bootDone && (
        <div className="fixed inset-0 z-[9999]">
          <ErrorBoundary>
            <BootScreen />
          </ErrorBoundary>
        </div>
      )}

      {/* Onboarding primo avvio: appare dopo il boot se il token manca */}
      {showOnboarding && (
        <ErrorBoundary>
          <Onboarding onComplete={() => setOnboardingDone(true)} />
        </ErrorBoundary>
      )}
    </>
  )
}

function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, dehydrateOptions: { shouldDehydrateQuery } }}
    >
      <HashRouter>
        <AppInit />
      </HashRouter>
    </PersistQueryClientProvider>
  )
}

export default App
