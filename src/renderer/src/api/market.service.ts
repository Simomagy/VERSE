import { uexClient } from './uex.client'
import type { Commodity, CommodityPrice, TradeRoute } from './types'

export class MarketService {
  /**
   * Lista di tutte le commodity
   */
  async getCommodities(): Promise<Commodity[]> {
    return uexClient.get<Commodity[]>('/commodities')
  }

  /**
   * Prezzi per una commodity specifica (richiede id_commodity o id_terminal)
   */
  async getCommodityPrices(params: {
    id_commodity?: number
    id_terminal?: number
    commodity_name?: string
    terminal_name?: string
  }): Promise<CommodityPrice[]> {
    return uexClient.get<CommodityPrice[]>('/commodities_prices', params)
  }

  /**
   * Tutti i prezzi di tutte le commodity
   * Questo endpoint restituisce un dataset molto grande — usa lo stale time lungo
   */
  async getAllCommodityPrices(): Promise<CommodityPrice[]> {
    return uexClient.get<CommodityPrice[]>('/commodities_prices_all')
  }

  /**
   * Rotte commerciali — richiede almeno un parametro obbligatorio
   */
  async getRoutes(params: {
    id_terminal_origin?: number
    id_planet_origin?: number
    id_orbit_origin?: number
    id_commodity?: number
    id_terminal_destination?: number
    investment?: number
  }): Promise<TradeRoute[]> {
    return uexClient.get<TradeRoute[]>('/commodities_routes', params)
  }
}

export const marketService = new MarketService()
