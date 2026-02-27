import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatta un numero in formato valuta UEC (United Earth Credits)
 */
export function formatUEC(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value) + ' aUEC'
}

/**
 * Formatta una data in formato relativo (es. "2 ore fa")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const timestamp = typeof date === 'number' ? date : new Date(date).getTime()
  const now = Date.now()
  const diff = now - timestamp

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) {
    return new Date(timestamp).toLocaleDateString()
  } else if (days > 0) {
    return `${days}d ago`
  } else if (hours > 0) {
    return `${hours}h ago`
  } else if (minutes > 0) {
    return `${minutes}m ago`
  } else {
    return 'just now'
  }
}

/**
 * Calcola il profitto percentuale tra due valori
 */
export function calculateProfit(buy: number, sell: number): number {
  return ((sell - buy) / buy) * 100
}

/**
 * Abbreviates a long name to its initials when it exceeds maxLen characters.
 * "Construction Material Salvage" → "CMS"
 */
export function abbrev(name: string, maxLen = 16): string {
  if (!name || name.length <= maxLen) return name
  const initials = name
    .split(/[\s\-_]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .join('')
  return initials
}
