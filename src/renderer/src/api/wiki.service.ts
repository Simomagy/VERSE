import axios from 'axios'
import type { WikiVehicle, WikiVehiclesResponse } from './types'

const WIKI_BASE_URL = 'https://api.star-citizen.wiki/api/v2'
const PAGE_SIZE = 100

const wikiClient = axios.create({
  baseURL: WIKI_BASE_URL,
  timeout: 15000
})

export async function fetchAllVehicles(): Promise<WikiVehicle[]> {
  const firstPage = await wikiClient.get<WikiVehiclesResponse>('/vehicles', {
    params: { locale: 'en_EN', 'page[size]': PAGE_SIZE, 'page[number]': 1 }
  })

  const { data, meta } = firstPage.data
  const remaining = meta.last_page - 1

  if (remaining === 0) return data

  const pageRequests = Array.from({ length: remaining }, (_, i) =>
    wikiClient.get<WikiVehiclesResponse>('/vehicles', {
      params: { locale: 'en_EN', 'page[size]': PAGE_SIZE, 'page[number]': i + 2 }
    })
  )

  const pages = await Promise.all(pageRequests)
  return [...data, ...pages.flatMap((p) => p.data.data)]
}

export async function fetchVehicleBySlug(slug: string): Promise<WikiVehicle | null> {
  try {
    const res = await wikiClient.get<{ data: WikiVehicle }>(`/vehicles/${slug}`, {
      params: { locale: 'en_EN' }
    })
    return res.data.data
  } catch {
    return null
  }
}
