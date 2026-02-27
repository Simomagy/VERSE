import { uexClient } from './uex.client'
import type { FleetVehicle } from './types'

export class FleetService {
  /**
   * Flotta personale dell'utente
   * Richiede header 'secret-key' con token personale
   */
  async getFleet(): Promise<FleetVehicle[]> {
    return uexClient.get<FleetVehicle[]>('/fleet')
  }
}

export const fleetService = new FleetService()
