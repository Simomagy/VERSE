import { uexClient } from './uex.client'
import type { RefineryMethod, RefineryYield } from './types'

class RefineryService {
  async getMethods(): Promise<RefineryMethod[]> {
    return uexClient.get<RefineryMethod[]>('/refineries_methods')
  }

  async getYields(): Promise<RefineryYield[]> {
    return uexClient.get<RefineryYield[]>('/refineries_yields')
  }

  /**
   * Restituisce il bonus yield % per una commodity in una location specifica.
   * Fa match case-insensitive sul nome. Ritorna null se non trovato.
   */
  findYieldBonus(yields: RefineryYield[], commodity: string, terminal: string): number | null {
    const normalizedCommodity = commodity.toLowerCase()
    const normalizedTerminal = terminal.toLowerCase()

    const match = yields.find(
      (y) =>
        y.commodity_name.toLowerCase().includes(normalizedCommodity) &&
        y.terminal_name.toLowerCase().includes(normalizedTerminal)
    )

    return match?.value ?? null
  }
}

export const refineryService = new RefineryService()
