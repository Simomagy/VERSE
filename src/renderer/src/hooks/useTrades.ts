import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { LocalTrade } from '../api/types'

const TRADES_KEY = ['trades', 'local']
const WALLET_KEY = ['wallet', 'local']

export function useLocalTrades() {
  return useQuery<LocalTrade[]>({
    queryKey: TRADES_KEY,
    queryFn: () => window.api.trades.getAll(),
    staleTime: Infinity
  })
}

export function useAddTrade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (trade: Omit<LocalTrade, 'id' | 'dateAdded'>) =>
      window.api.trades.add(trade),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRADES_KEY })
      queryClient.invalidateQueries({ queryKey: WALLET_KEY })
    }
  })
}

export function useUpdateTrade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (trade: LocalTrade) => window.api.trades.update(trade),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRADES_KEY })
      queryClient.invalidateQueries({ queryKey: WALLET_KEY })
    }
  })
}

export function useRemoveTrade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => window.api.trades.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRADES_KEY })
      queryClient.invalidateQueries({ queryKey: WALLET_KEY })
    }
  })
}
