import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { LocalWalletEntry } from '../api/types'

const WALLET_KEY = ['wallet', 'local']

export function useWalletEntries() {
  return useQuery<LocalWalletEntry[]>({
    queryKey: WALLET_KEY,
    queryFn: () => window.api.wallet.getAll(),
    staleTime: Infinity
  })
}

export function useAddWalletEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (entry: Omit<LocalWalletEntry, 'id' | 'dateAdded'>) => window.api.wallet.add(entry),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WALLET_KEY })
  })
}

export function useUpdateWalletEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (entry: LocalWalletEntry) => window.api.wallet.update(entry),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WALLET_KEY })
  })
}

export function useRemoveWalletEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => window.api.wallet.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WALLET_KEY })
  })
}

/**
 * Calcola il balance corrente dall'array di voci ordinate per data.
 * - income     → balance += amount
 * - expense    → balance -= amount
 * - adjustment → balance  = amount (snapshot assoluto del saldo)
 */
export function computeBalance(entries: LocalWalletEntry[]): number {
  const sorted = [...entries].sort((a, b) => a.dateAdded - b.dateAdded)
  let balance = 0
  for (const e of sorted) {
    if (e.type === 'income') balance += e.amount
    else if (e.type === 'expense') balance -= e.amount
    else if (e.type === 'adjustment') balance = e.amount
  }
  return balance
}

export function useWalletBalance(): number {
  const { data: entries = [] } = useWalletEntries()
  return useMemo(() => computeBalance(entries), [entries])
}
