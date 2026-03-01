import { useQuery } from '@tanstack/react-query'
import {
  normalizeItemName,
  fetchEquipmentImageUrl,
  isMissingSentinel
} from '../api/equipment-image.service'

async function resolveEquipmentImageUrl(itemName: string): Promise<string | null> {
  const normalized = normalizeItemName(itemName)

  const cached = await window.api.imageCache.get(normalized)

  if (cached !== null) {
    return isMissingSentinel(cached) ? null : cached
  }

  const url = await fetchEquipmentImageUrl(normalized)
  await window.api.imageCache.set(normalized, url)

  return isMissingSentinel(url) ? null : url
}

export function useEquipmentImage(itemName: string, enabled = true) {
  const normalized = normalizeItemName(itemName)

  return useQuery<string | null>({
    queryKey: ['equipmentImage', normalized],
    queryFn: () => resolveEquipmentImageUrl(itemName),
    staleTime: Infinity,
    retry: false,
    enabled
  })
}
