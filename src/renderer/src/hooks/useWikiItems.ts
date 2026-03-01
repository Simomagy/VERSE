import { useState, useEffect, useRef } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { fetchWikiItemsPage } from '../api/wiki-items.service'
import type { WikiArmorItem, WikiArmorItemsResponse, WikiItemQuery } from '../api/types'

const STALE_TIME_24H = 24 * 60 * 60 * 1000
const FETCH_CONCURRENCY = 2

async function fetchInBatches<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number
): Promise<T[]> {
  const results: T[] = []
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency)
    const batchResults = await Promise.all(batch.map((fn) => fn()))
    results.push(...batchResults)
  }
  return results
}

interface InfiniteData {
  pages: WikiArmorItemsResponse[]
  pageParams: unknown[]
}

function deduplicateBaseVariants(pages: WikiArmorItemsResponse[]): WikiArmorItem[] {
  const seen = new Set<string>()
  const result: WikiArmorItem[] = []
  for (const page of pages) {
    for (const item of page.data) {
      if (!item.is_base_variant || seen.has(item.uuid)) continue
      if (item.name.includes('<= PLACEHOLDER =>')) continue
      seen.add(item.uuid)
      result.push(item)
    }
  }
  return result
}

export function useWikiItems(query: WikiItemQuery) {
  const queryClient = useQueryClient()
  const queryKey = ['wikiItems', query.filterKey, query.filterValue] as const
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const fetchingRef = useRef(false)

  const infiniteQuery = useInfiniteQuery<WikiArmorItemsResponse>({
    queryKey,
    queryFn: ({ pageParam }) => fetchWikiItemsPage(query, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.meta
      return current_page < last_page ? current_page + 1 : undefined
    },
    staleTime: STALE_TIME_24H,
    retry: 2
  })

  const { isLoading } = infiniteQuery
  const firstPage = infiniteQuery.data?.pages[0]
  const fetchedCount = infiniteQuery.data?.pages.length ?? 0

  useEffect(() => {
    if (!firstPage || isLoading || fetchingRef.current) return

    const { last_page } = firstPage.meta
    if (fetchedCount >= last_page) return

    const missingPages = Array.from(
      { length: last_page - fetchedCount },
      (_, i) => fetchedCount + i + 1
    )

    fetchingRef.current = true
    setIsFetchingMore(true)

    fetchInBatches(
      missingPages.map((p) => () => fetchWikiItemsPage(query, p)),
      FETCH_CONCURRENCY
    )
      .then((fetched) => {
        queryClient.setQueryData<InfiniteData>(queryKey, (old) => {
          if (!old) return old
          return {
            pages: [...old.pages, ...fetched],
            pageParams: [...old.pageParams, ...missingPages]
          }
        })
      })
      .finally(() => {
        fetchingRef.current = false
        setIsFetchingMore(false)
      })
  }, [firstPage, fetchedCount, isLoading])

  const items = infiniteQuery.data ? deduplicateBaseVariants(infiniteQuery.data.pages) : []
  const totalInApi = firstPage?.meta.total ?? 0
  const isFullyLoaded = !isLoading && !isFetchingMore && fetchedCount > 0 && !infiniteQuery.hasNextPage

  return {
    items,
    totalInApi,
    isLoading,
    isFetchingMore,
    isFullyLoaded
  }
}
