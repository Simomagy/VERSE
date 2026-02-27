import axios from 'axios'
import type {
  WikiStarSystem,
  WikiStarSystemsResponse,
  WikiCelestialObject,
  WikiCelestialObjectsResponse,
  Commodity,
  UEXSpaceStation,
  UEXCity,
  UEXOutpost
} from './types'
import { fetchAllVehicles } from './wiki.service'
import { uexClient } from './uex.client'

const WIKI_BASE_URL = 'https://api.star-citizen.wiki/api'
const PAGE_SIZE = 100
const BATCH_CONCURRENCY = 5

const wikiBaseClient = axios.create({
  baseURL: WIKI_BASE_URL,
  timeout: 20000
})

// ─── Paginated fetch helper ─────────────────────────────────────────────────

async function fetchAllPages<T>(
  fetchPage: (page: number) => Promise<{ data: T[]; meta: { last_page: number } }>,
  concurrency = BATCH_CONCURRENCY
): Promise<T[]> {
  const first = await fetchPage(1)
  const results: T[] = [...first.data]
  const remaining = first.meta.last_page - 1

  if (remaining === 0) return results

  const pages = Array.from({ length: remaining }, (_, i) => i + 2)

  for (let i = 0; i < pages.length; i += concurrency) {
    const batch = pages.slice(i, i + concurrency)
    const batchResults = await Promise.all(batch.map(fetchPage))
    results.push(...batchResults.flatMap((r) => r.data))
  }

  return results
}

// ─── Star Systems ───────────────────────────────────────────────────────────

async function fetchSystemsPage(page: number): Promise<WikiStarSystemsResponse> {
  const res = await wikiBaseClient.get<WikiStarSystemsResponse>('/starsystems', {
    params: { locale: 'en_EN', 'page[size]': PAGE_SIZE, 'page[number]': page }
  })
  return res.data
}

export async function fetchAllSystems(): Promise<WikiStarSystem[]> {
  return fetchAllPages(fetchSystemsPage)
}

// ─── Celestial Objects (pianeti, lune, stazioni, ecc.) ─────────────────────
// Solo i sistemi rilevanti per il gameplay di trading attuale

const TARGET_SYSTEMS = ['Stanton', 'Pyro', 'Nyx'] as const

function makeCelestialObjectsPageFetcher(
  systemName: string
): (page: number) => Promise<WikiCelestialObjectsResponse> {
  return async (page: number) => {
    const res = await wikiBaseClient.get<WikiCelestialObjectsResponse>('/celestial-objects', {
      params: {
        'page[size]': PAGE_SIZE,
        'page[number]': page,
        'filter[starsystem.name]': systemName
      }
    })
    return res.data
  }
}

export async function fetchAllCelestialObjects(): Promise<WikiCelestialObject[]> {
  // Fetch i 3 sistemi in parallelo, ognuno paginato
  const systemResults = await Promise.all(
    TARGET_SYSTEMS.map((system) => fetchAllPages(makeCelestialObjectsPageFetcher(system)))
  )

  // Merge con deduplicazione per id (l'API può restituire oggetti sovrapposti)
  const seen = new Set<number>()
  const merged: WikiCelestialObject[] = []

  for (const objects of systemResults) {
    for (const obj of objects) {
      if (!seen.has(obj.id)) {
        seen.add(obj.id)
        merged.push(obj)
      }
    }
  }

  return merged
}

// ─── Commodities (UEX) ──────────────────────────────────────────────────────

export async function fetchAllCommodities(): Promise<Commodity[]> {
  const response = await uexClient.get<Commodity[]>('/commodities')
  return response ?? []
}

// ─── Space Stations (UEX) ───────────────────────────────────────────────────

export async function fetchAllSpaceStations(): Promise<UEXSpaceStation[]> {
  const response = await uexClient.get<UEXSpaceStation[]>('/space_stations')
  return response ?? []
}

// ─── Cities (UEX) ───────────────────────────────────────────────────────────

export async function fetchAllCities(): Promise<UEXCity[]> {
  const response = await uexClient.get<UEXCity[]>('/cities')
  return response ?? []
}

// ─── Outposts (UEX) ──────────────────────────────────────────────────────────

export async function fetchAllOutposts(): Promise<UEXOutpost[]> {
  const response = await uexClient.get<UEXOutpost[]>('/outposts')
  return response ?? []
}

// ─── Re-export vehicles ─────────────────────────────────────────────────────

export { fetchAllVehicles }
