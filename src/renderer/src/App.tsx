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
import { UpdateBanner } from './components/layout/UpdateBanner'
import { ErrorBoundary } from './components/ErrorBoundary'

const BOOT_LINGER_MS = 1500
const PERSIST_MAX_AGE_7D = 7 * 24 * 60 * 60 * 1000

// Le query IPC-locali vivono in electron-store: non vanno duplicate in localStorage.
const LOCAL_QUERY_PREFIXES = new Set(['wallet', 'trades', 'fleet', 'refinery'])

function shouldDehydrateQuery(query: { queryKey: readonly unknown[] }): boolean {
  const first = query.queryKey[0] as string
  return !LOCAL_QUERY_PREFIXES.has(first)
}

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 2,
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60 * 24
      }
    }
  })
}

function AppInit({ queryClient }: { queryClient: QueryClient }) {
  const loadTokens = useAuthStore((state) => state.loadTokens)
  const isAppTokenSet = useAuthStore((state) => state.isAppTokenSet)
  const isLoading = useAuthStore((state) => state.isLoading)
  const loadSettings = useSettingsStore((state) => state.loadSettings)
  const staticStatus = useStaticDataStore((state) => state.status)

  const [bootDone, setBootDone] = useState(false)
  const [onboardingDone, setOnboardingDone] = useState(false)

  useEffect(() => {
    loadTokens()
    loadSettings()

    queryClient.prefetchQuery({
      queryKey: ['wallet', 'local'],
      queryFn: () => window.api.wallet.getAll(),
      staleTime: Infinity
    })
    queryClient.prefetchQuery({
      queryKey: ['fleet', 'local'],
      queryFn: () => window.api.fleet.getAll(),
      staleTime: Infinity
    })
    queryClient.prefetchQuery({
      queryKey: ['trades', 'local'],
      queryFn: () => window.api.trades.getAll(),
      staleTime: Infinity
    })
    queryClient.prefetchQuery({
      queryKey: ['refinery', 'jobs'],
      queryFn: () => window.api.refineryJobs.getAll(),
      staleTime: Infinity
    })
  }, [])

  useEffect(() => {
    if (staticStatus === 'ready' || staticStatus === 'error') {
      const timer = setTimeout(() => setBootDone(true), BOOT_LINGER_MS)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [staticStatus])

  const showOnboarding = bootDone && !isLoading && !isAppTokenSet && !onboardingDone

  return (
    <>
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>

      {!bootDone && (
        <div className="fixed inset-0 z-[9999]">
          <ErrorBoundary>
            <BootScreen />
          </ErrorBoundary>
        </div>
      )}

      {showOnboarding && (
        <ErrorBoundary>
          <Onboarding onComplete={() => setOnboardingDone(true)} />
        </ErrorBoundary>
      )}

      <UpdateBanner />
    </>
  )
}

function App() {
  // Lazy init: evita che queryClient e persister vengano creati a livello modulo
  // prima che il browser context (localStorage) sia garantito pronto.
  const [queryClient] = useState(() => createQueryClient())
  const [persister] = useState(() =>
    createSyncStoragePersister({ storage: window.localStorage })
  )

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: PERSIST_MAX_AGE_7D, dehydrateOptions: { shouldDehydrateQuery } }}
    >
      <HashRouter>
        <AppInit queryClient={queryClient} />
      </HashRouter>
    </PersistQueryClientProvider>
  )
}

export default App
