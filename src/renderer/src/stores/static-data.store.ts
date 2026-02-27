import { create } from 'zustand'
import type { WikiVehicle, WikiStarSystem, WikiCelestialObject, Commodity, UEXSpaceStation, UEXCity, UEXOutpost } from '../api/types'
import {
  fetchAllVehicles,
  fetchAllSystems,
  fetchAllCelestialObjects,
  fetchAllCommodities,
  fetchAllSpaceStations,
  fetchAllCities,
  fetchAllOutposts
} from '../api/static-data.service'

export type DatasetStatus = 'idle' | 'loading' | 'done' | 'error'
export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface DatasetProgress {
  ships: DatasetStatus
  systems: DatasetStatus
  locations: DatasetStatus
  commodities: DatasetStatus
  stations: DatasetStatus
  cities: DatasetStatus
  outposts: DatasetStatus
}

interface StaticDataState {
  ships: WikiVehicle[]
  systems: WikiStarSystem[]
  celestialObjects: WikiCelestialObject[]
  commodities: Commodity[]
  spaceStations: UEXSpaceStation[]
  cities: UEXCity[]
  outposts: UEXOutpost[]
  status: LoadStatus
  progress: DatasetProgress
  error: string | null
  load: () => Promise<void>
  reset: () => void
}

const INITIAL_PROGRESS: DatasetProgress = {
  ships: 'idle',
  systems: 'idle',
  locations: 'idle',
  commodities: 'idle',
  stations: 'idle',
  cities: 'idle',
  outposts: 'idle'
}

const DATASET_KEYS: (keyof DatasetProgress)[] = [
  'ships', 'systems', 'locations', 'commodities', 'stations', 'cities', 'outposts'
]

export const useStaticDataStore = create<StaticDataState>((set, get) => ({
  ships: [],
  systems: [],
  celestialObjects: [],
  commodities: [],
  spaceStations: [],
  cities: [],
  outposts: [],
  status: 'idle',
  progress: INITIAL_PROGRESS,
  error: null,

  load: async () => {
    if (get().status !== 'idle') return

    set({
      status: 'loading',
      error: null,
      progress: {
        ships: 'loading',
        systems: 'loading',
        locations: 'loading',
        commodities: 'loading',
        stations: 'loading',
        cities: 'loading',
        outposts: 'loading'
      }
    })

    const results = await Promise.allSettled([
      fetchAllVehicles().then((data) => {
        set((s) => ({ ships: data, progress: { ...s.progress, ships: 'done' } }))
        return data
      }),
      fetchAllSystems().then((data) => {
        set((s) => ({ systems: data, progress: { ...s.progress, systems: 'done' } }))
        return data
      }),
      fetchAllCelestialObjects().then((data) => {
        set((s) => ({ celestialObjects: data, progress: { ...s.progress, locations: 'done' } }))
        return data
      }),
      fetchAllCommodities().then((data) => {
        set((s) => ({ commodities: data, progress: { ...s.progress, commodities: 'done' } }))
        return data
      }),
      fetchAllSpaceStations().then((data) => {
        set((s) => ({ spaceStations: data, progress: { ...s.progress, stations: 'done' } }))
        return data
      }),
      fetchAllCities().then((data) => {
        set((s) => ({ cities: data, progress: { ...s.progress, cities: 'done' } }))
        return data
      }),
      fetchAllOutposts().then((data) => {
        set((s) => ({ outposts: data, progress: { ...s.progress, outposts: 'done' } }))
        return data
      })
    ])

    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map((r) => (r.reason as Error)?.message ?? 'unknown error')

    const progressUpdate: Partial<DatasetProgress> = {}
    results.forEach((r, i) => {
      if (r.status === 'rejected') progressUpdate[DATASET_KEYS[i]] = 'error'
    })

    if (errors.length > 0) {
      set((s) => ({
        progress: { ...s.progress, ...progressUpdate },
        status: errors.length === DATASET_KEYS.length ? 'error' : 'ready',
        error: errors.join(' | ')
      }))
    } else {
      set({ status: 'ready' })
    }
  },

  reset: () =>
    set({
      ships: [],
      systems: [],
      celestialObjects: [],
      commodities: [],
      spaceStations: [],
      cities: [],
      outposts: [],
      status: 'idle',
      progress: INITIAL_PROGRESS,
      error: null
    })
}))
