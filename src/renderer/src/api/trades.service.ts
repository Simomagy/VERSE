import { uexClient } from './uex.client'
import type { UserTrade } from './types'

export class TradesService {
  /**
   * Storico trade dell'utente
   * Richiede header 'secret-key' con token personale
   */
  async getUserTrades(): Promise<UserTrade[]> {
    return uexClient.get<UserTrade[]>('/user_trades')
  }

  /**
   * Statistiche aggregate dai trade
   */
  calculateStats(trades: UserTrade[]): {
    totalTrades: number
    totalBuys: number
    totalSells: number
    totalSpent: number
    totalEarned: number
    totalSCU: number
    topCommodity: string | null
  } {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        totalBuys: 0,
        totalSells: 0,
        totalSpent: 0,
        totalEarned: 0,
        totalSCU: 0,
        topCommodity: null
      }
    }

    const buys = trades.filter((t) => t.operation === 'buy')
    const sells = trades.filter((t) => t.operation === 'sell')

    const totalSpent = buys.reduce((sum, t) => sum + t.price * t.scu, 0)
    const totalEarned = sells.reduce((sum, t) => sum + t.price * t.scu, 0)
    const totalSCU = trades.reduce((sum, t) => sum + t.scu, 0)

    const commodityCount = trades.reduce(
      (acc, t) => {
        acc[t.commodity_name] = (acc[t.commodity_name] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const topCommodity =
      Object.entries(commodityCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null

    return {
      totalTrades: trades.length,
      totalBuys: buys.length,
      totalSells: sells.length,
      totalSpent,
      totalEarned,
      totalSCU,
      topCommodity
    }
  }
}

export const tradesService = new TradesService()
