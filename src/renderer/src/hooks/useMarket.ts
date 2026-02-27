import { useQuery } from '@tanstack/react-query'
import { marketService } from '../api/market.service'

export function useCommodities() {
  return useQuery({
    queryKey: ['commodities'],
    queryFn: () => marketService.getCommodities(),
    staleTime: 30 * 60 * 1000 // 30 minuti
  })
}

export function useCommodityPrices(params: {
  id_commodity?: number
  commodity_name?: string
  id_terminal?: number
  terminal_name?: string
}) {
  const hasParam = Object.values(params).some((v) => v !== undefined && v !== '')

  return useQuery({
    queryKey: ['commodity-prices', params],
    queryFn: () => marketService.getCommodityPrices(params),
    staleTime: 30 * 60 * 1000, // 30 minuti (cache TTL doc: +30 min)
    enabled: hasParam
  })
}

export function useAllCommodityPrices() {
  return useQuery({
    queryKey: ['commodity-prices-all'],
    queryFn: () => marketService.getAllCommodityPrices(),
    staleTime: 30 * 60 * 1000
  })
}

export function useRoutes(params: {
  id_terminal_origin?: number
  id_planet_origin?: number
  id_orbit_origin?: number
  id_commodity?: number
  investment?: number
}) {
  const hasRequiredParam =
    params.id_terminal_origin !== undefined ||
    params.id_planet_origin !== undefined ||
    params.id_orbit_origin !== undefined ||
    params.id_commodity !== undefined

  return useQuery({
    queryKey: ['routes', params],
    queryFn: () => marketService.getRoutes(params),
    staleTime: 30 * 60 * 1000,
    enabled: hasRequiredParam
  })
}
