import { uexClient } from './uex.client'
import type { DataExtractType, DataExtractResponse } from './types'

export class DataService {
  /**
   * Estrae dati aggregati da UEX
   * Non richiede autenticazione
   */
  async extractData(type: DataExtractType): Promise<string> {
    try {
      const response = await uexClient.get<string>('/data_extract', { data: type })
      return response || ''
    } catch (error) {
      console.error(`[DataService] Failed to extract data for ${type}:`, error)
      return ''
    }
  }

  /**
   * Ottiene le migliori rotte commerciali (formato testuale)
   */
  async getBestRoutesText(): Promise<string> {
    return this.extractData('commodities_routes')
  }

  /**
   * Ottiene i prezzi medi delle commodity (formato testuale)
   */
  async getCommodityPricesText(): Promise<string> {
    return this.extractData('commodities_prices')
  }

  /**
   * Ottiene gli ultimi report inviati dai datarunner
   */
  async getLastReports(): Promise<string> {
    return this.extractData('last_commodity_data_reports')
  }

  /**
   * Parsea le rotte dal formato testuale
   */
  parseRoutesText(text: string): Array<{
    commodity: string
    from: string
    to: string
    profit: string
  }> {
    const routes: Array<{
      commodity: string
      from: string
      to: string
      profit: string
    }> = []

    // Esempio formato: "Gold: Shubin SCD-1 ▶ TDD New Babbage = 4,5M UEC (avg)"
    const lines = text.split('\n').filter(line => line.includes('▶'))

    for (const line of lines) {
      const match = line.match(/^•?\s*(.+?):\s*(.+?)\s*▶\s*(.+?)\s*=\s*(.+?)$/i)
      if (match) {
        routes.push({
          commodity: match[1].trim(),
          from: match[2].trim(),
          to: match[3].trim(),
          profit: match[4].trim()
        })
      }
    }

    return routes
  }

  /**
   * Parsea i prezzi dal formato testuale
   */
  parsePricesText(text: string): Array<{
    commodity: string
    location: string
    price: string
  }> {
    const prices: Array<{
      commodity: string
      location: string
      price: string
    }> = []

    // Parse del formato testuale dei prezzi
    const lines = text.split('\n').filter(line => line.trim())

    for (const line of lines) {
      // Formato: "Commodity @ Location: Price UEC"
      const match = line.match(/^•?\s*(.+?)\s*@\s*(.+?):\s*(.+?)$/i)
      if (match) {
        prices.push({
          commodity: match[1].trim(),
          location: match[2].trim(),
          price: match[3].trim()
        })
      }
    }

    return prices
  }
}

export const dataService = new DataService()
