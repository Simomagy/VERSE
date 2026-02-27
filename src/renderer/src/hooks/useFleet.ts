import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { LocalShip } from '../api/types'

const FLEET_KEY = ['fleet', 'local']

export function useLocalFleet() {
  return useQuery<LocalShip[]>({
    queryKey: FLEET_KEY,
    queryFn: () => window.api.fleet.getAll(),
    staleTime: Infinity
  })
}

export function useAddShip() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ship: Omit<LocalShip, 'id' | 'dateAdded'>) =>
      window.api.fleet.add(ship),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FLEET_KEY })
  })
}

export function useUpdateShip() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ship: LocalShip) => window.api.fleet.update(ship),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FLEET_KEY })
  })
}

export function useRemoveShip() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => window.api.fleet.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FLEET_KEY })
  })
}
