import axios from 'axios'
import type { WikiArmorItemsResponse, WikiItemQuery } from './types'

const WIKI_API_BASE = 'https://api.star-citizen.wiki/api'
const PAGE_SIZE = 200

const wikiItemsClient = axios.create({
  baseURL: WIKI_API_BASE,
  timeout: 20000
})

export async function fetchWikiItemsPage(
  query: WikiItemQuery,
  page: number
): Promise<WikiArmorItemsResponse> {
  const res = await wikiItemsClient.get<WikiArmorItemsResponse>('/items', {
    params: {
      [query.filterKey]: query.filterValue,
      'page[size]': PAGE_SIZE,
      'page[number]': page,
      locale: 'en_EN'
    }
  })
  return res.data
}
