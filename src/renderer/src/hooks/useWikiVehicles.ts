import { useQuery } from '@tanstack/react-query'
import { fetchAllVehicles } from '../api/wiki.service'
import type { WikiVehicle } from '../api/types'

const STALE_TIME_1H = 60 * 60 * 1000

export function useWikiVehicles() {
  return useQuery<WikiVehicle[]>({
    queryKey: ['wiki', 'vehicles'],
    queryFn: fetchAllVehicles,
    staleTime: STALE_TIME_1H,
    retry: 2
  })
}
