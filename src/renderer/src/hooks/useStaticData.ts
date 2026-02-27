import { useStaticDataStore } from '../stores/static-data.store'
import type { CelestialObjectType, UEXSpaceStation, UEXCity, WikiCelestialObject } from '../api/types'

const LOCATION_TYPES: CelestialObjectType[] = ['PLANET', 'SATELLITE', 'MANMADE']

// Stanton=68, Pyro=64, Nyx=55
const TRADE_SYSTEM_IDS = new Set([68, 64, 55])

export function useStaticData() {
  const store = useStaticDataStore()

  const getPlanets = (): WikiCelestialObject[] =>
    store.celestialObjects.filter((o) => o.type === 'PLANET')

  const getMoons = (): WikiCelestialObject[] =>
    store.celestialObjects.filter((o) => o.type === 'SATELLITE')

  const getStations = (): WikiCelestialObject[] =>
    store.celestialObjects.filter((o) => o.type === 'MANMADE')

  // Pianeti + lune + stazioni — usato nei form di inserimento trade/location
  const getLocations = (): WikiCelestialObject[] =>
    store.celestialObjects.filter((o) => LOCATION_TYPES.includes(o.type))

  const getSystemByCode = (code: string) =>
    store.systems.find((s) => s.code.trim() === code.trim()) ?? null

  const getCelestialObjectsBySystem = (systemId: number): WikiCelestialObject[] =>
    store.celestialObjects.filter((o) => o.system_id === systemId)

  const findShipBySlug = (slug: string) =>
    store.ships.find((s) => s.slug === slug) ?? null

  const findCommodityByName = (name: string) =>
    store.commodities.find((c) => c.name.toLowerCase() === name.toLowerCase()) ?? null

  // Location con raffineria attiva — space stations + cities filtrate per has_refinery
  const getRefineries = (): (UEXSpaceStation | UEXCity)[] => [
    ...store.spaceStations.filter((s) => s.has_refinery === 1 && s.is_available === 1),
    ...store.cities.filter((c) => c.has_refinery === 1 && c.is_available === 1)
  ]

  // Tutte le location di trading: space stations + città + outpost filtrati per i 3 sistemi
  const getTradeLocations = (): string[] => {
    const names = new Set<string>()

    for (const s of store.spaceStations) {
      if (TRADE_SYSTEM_IDS.has(s.id_star_system) && s.is_available === 1 && s.name)
        names.add(s.name)
    }
    for (const c of store.cities) {
      if (TRADE_SYSTEM_IDS.has(c.id_star_system) && c.is_available === 1 && c.name)
        names.add(c.name)
    }
    for (const o of store.outposts) {
      if (TRADE_SYSTEM_IDS.has(o.id_star_system) && o.is_available === 1 && o.name)
        names.add(o.name)
    }

    return Array.from(names).sort()
  }

  return {
    ...store,
    getPlanets,
    getMoons,
    getStations,
    getLocations,
    getRefineries,
    getTradeLocations,
    getSystemByCode,
    getCelestialObjectsBySystem,
    findShipBySlug,
    findCommodityByName
  }
}
