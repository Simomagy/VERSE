import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { uexClient } from '../api/uex.client'
import type { CommodityPrice } from '../api/types'

const PRICES_KEY = ['commodity-prices-all']
const STALE_TIME_MS = 5 * 60 * 1000 // auto-stale dopo 5 min
const COOLDOWN_MS = 60 * 1000 // cooldown refresh manuale: 1 min

export function useCommodityPrices() {
  const queryClient = useQueryClient()
  const [lastRefreshMs, setLastRefreshMs] = useState(0)
  const [cooldown, setCooldown] = useState(0)

  const query = useQuery<CommodityPrice[]>({
    queryKey: PRICES_KEY,
    queryFn: () => uexClient.get<CommodityPrice[]>('/commodities_prices_all'),
    staleTime: STALE_TIME_MS,
    gcTime: 30 * 60 * 1000,
    retry: 1
  })

  // Countdown visualizzato all'utente (secondi)
  useEffect(() => {
    if (!lastRefreshMs) return
    const tick = () => {
      const remaining = COOLDOWN_MS - (Date.now() - lastRefreshMs)
      setCooldown(remaining > 0 ? Math.ceil(remaining / 1000) : 0)
    }
    tick()
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [lastRefreshMs])

  const refresh = useCallback(() => {
    if (cooldown > 0) return
    setLastRefreshMs(Date.now())
    setCooldown(COOLDOWN_MS / 1000)
    queryClient.invalidateQueries({ queryKey: PRICES_KEY })
  }, [cooldown, queryClient])

  // Lookup prezzo per commodity+location+operation.
  // Ritorna price_buy o price_sell (> 0), altrimenti null.
  const getPriceAt = useCallback(
    (commodity: string, location: string, operation: 'buy' | 'sell'): number | null => {
      const prices = query.data ?? []
      const norm = (s: string | null | undefined) => (s ?? '').toLowerCase().trim()
      const c = norm(commodity)
      const l = norm(location)
      if (!c || !l) return null
      const match = prices.find((p) => norm(p.commodity_name) === c && norm(p.terminal_name) === l)
      if (!match) return null
      const price = operation === 'buy' ? match.price_buy : match.price_sell
      return price > 0 ? price : null
    },
    [query.data]
  )

  // Lista deduplicata e ordinata di terminal_name presenti nei dati prezzi.
  // Usata come suggestions per i campi location nel form trade.
  const terminalNames = useMemo(() => {
    if (!query.data?.length) return []
    const names = new Set<string>()
    for (const p of query.data) {
      if (p.terminal_name) names.add(p.terminal_name)
    }
    return [...names].sort()
  }, [query.data])

  return {
    prices: query.data ?? [],
    terminalNames,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    dataUpdatedAt: query.dataUpdatedAt,
    error: query.error,
    cooldown,
    refresh,
    getPriceAt
  }
}
