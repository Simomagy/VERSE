import { useQuery } from '@tanstack/react-query'
import { refineryService } from '../api/refinery.service'

const STALE_DAY = 1000 * 60 * 60 * 24 // Cache TTL doc: +1 day

export function useRefineryMethods() {
  return useQuery({
    queryKey: ['refinery-methods'],
    queryFn: () => refineryService.getMethods(),
    staleTime: STALE_DAY,
    gcTime: STALE_DAY * 7,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
}

export function useRefineryYields() {
  return useQuery({
    queryKey: ['refinery-yields'],
    queryFn: () => refineryService.getYields(),
    staleTime: STALE_DAY,
    gcTime: STALE_DAY * 7,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
}
