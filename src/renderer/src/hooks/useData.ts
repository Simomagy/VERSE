import { useQuery } from '@tanstack/react-query'
import { dataService } from '../api/data.service'
import type { DataExtractType } from '../api/types'

export function useDataExtract(type: DataExtractType) {
  return useQuery({
    queryKey: ['data-extract', type],
    queryFn: () => dataService.extractData(type),
    staleTime: 1000 * 60 * 60, // 1 ora
    gcTime: 1000 * 60 * 60 * 24, // 24 ore (mantiene in cache anche se inutilizzato)
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
}

export function useBestRoutesData() {
  const { data, ...rest } = useDataExtract('commodities_routes')
  
  return {
    ...rest,
    routes: data ? dataService.parseRoutesText(data) : []
  }
}

export function useCommodityPricesData() {
  const { data, ...rest } = useDataExtract('commodities_prices')
  
  return {
    ...rest,
    prices: data ? dataService.parsePricesText(data) : []
  }
}

export function useLastReportsData() {
  return useDataExtract('last_commodity_data_reports')
}
