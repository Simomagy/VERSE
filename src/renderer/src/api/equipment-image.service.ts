import axios from 'axios'

const MEDIAWIKI_BASE_URL = 'https://starcitizen.tools/api.php'
const THUMBNAIL_SIZE = 300

const MISSING_SENTINEL = ''

interface MediaWikiPage {
  pageid?: number
  missing?: true
  thumbnail?: {
    source: string
    width: number
    height: number
  }
}

interface MediaWikiQueryResponse {
  query?: {
    pages?: Record<string, MediaWikiPage>
  }
}

const mediaWikiClient = axios.create({
  baseURL: MEDIAWIKI_BASE_URL,
  timeout: 10000
})

export function normalizeItemName(name: string): string {
  return name.trim().replace(/\s+/g, '_')
}

export function isMissingSentinel(value: string): boolean {
  return value === MISSING_SENTINEL
}

export async function fetchEquipmentImageUrl(normalizedName: string): Promise<string> {
  try {
    const response = await mediaWikiClient.get<MediaWikiQueryResponse>('', {
      params: {
        action: 'query',
        prop: 'pageimages',
        piprop: 'thumbnail',
        pithumbsize: THUMBNAIL_SIZE,
        format: 'json',
        titles: normalizedName,
        redirects: 1,
        origin: '*'
      }
    })

    const pages = response.data?.query?.pages
    if (!pages) return MISSING_SENTINEL

    const page = Object.values(pages)[0]
    if (!page || page.missing || !page.thumbnail?.source) return MISSING_SENTINEL

    return page.thumbnail.source
  } catch {
    return MISSING_SENTINEL
  }
}
