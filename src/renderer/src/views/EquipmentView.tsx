import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Search, RefreshCw, X, ShoppingCart, ChevronLeft, ChevronRight, Package, Heart } from 'lucide-react'
import { BACKDROP_VARIANTS, MODAL_VARIANTS } from '../lib/animations'
import { useQueryClient } from '@tanstack/react-query'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { Button } from '../components/ui/button'
import { EquipmentImage } from '../components/ui/EquipmentImage'
import { LIST_VARIANTS, ROW_VARIANTS } from '../lib/animations'
import { useWikiItems } from '../hooks/useWikiItems'
import type { WikiArmorItem, WikiItemQuery } from '../api/types'

// ─── Tab config ───────────────────────────────────────────────────────────

interface SubTabConfig {
  id: string
  label: string
  query: WikiItemQuery
}

interface MainTabConfig {
  id: string
  label: string
  accent: string
  subTabs: SubTabConfig[]
}

const MAIN_TABS: MainTabConfig[] = [
  {
    id: 'fps-armor',
    label: 'FPS ARMOR',
    accent: '#4080ff',
    subTabs: [
      { id: 'all', label: 'ALL', query: { filterKey: 'filter[category]', filterValue: 'fps-armor' } }
    ]
  },
  {
    id: 'clothing',
    label: 'CLOTHING',
    accent: '#e87030',
    subTabs: [
      { id: 'torso1',    label: 'JACKETS',   query: { filterKey: 'filter[type]', filterValue: 'Char_Clothing_Torso_1' } },
      { id: 'torso0',    label: 'TOPS',       query: { filterKey: 'filter[type]', filterValue: 'Char_Clothing_Torso_0' } },
      { id: 'torso2',    label: 'UNDERSUIT',  query: { filterKey: 'filter[type]', filterValue: 'Char_Clothing_Torso_2' } },
      { id: 'legs',      label: 'LEGS',       query: { filterKey: 'filter[type]', filterValue: 'Char_Clothing_Legs' } },
      { id: 'feet',      label: 'FEET',       query: { filterKey: 'filter[type]', filterValue: 'Char_Clothing_Feet' } },
      { id: 'hands',     label: 'HANDS',      query: { filterKey: 'filter[type]', filterValue: 'Char_Clothing_Hands' } },
      { id: 'hat',       label: 'HATS',       query: { filterKey: 'filter[type]', filterValue: 'Char_Clothing_Hat' } },
      { id: 'backpack',  label: 'BACKPACKS',  query: { filterKey: 'filter[type]', filterValue: 'Char_Clothing_Backpack' } },
      { id: 'eyes',      label: 'GLASSES',    query: { filterKey: 'filter[type]', filterValue: 'Char_Accessory_Eyes' } },
      { id: 'head-acc',  label: 'HEAD ACC',   query: { filterKey: 'filter[type]', filterValue: 'Char_Accessory_Head' } }
    ]
  },
  {
    id: 'weapons',
    label: 'WEAPONS',
    accent: '#ff4040',
    subTabs: [
      { id: 'all', label: 'ALL', query: { filterKey: 'filter[type]', filterValue: 'WeaponPersonal' } }
    ]
  },
  {
    id: 'ship',
    label: 'SHIP',
    accent: '#00c88a',
    subTabs: [
      { id: 'gun',      label: 'GUNS',        query: { filterKey: 'filter[type]', filterValue: 'WeaponGun' } },
      { id: 'missile',  label: 'MISSILES',    query: { filterKey: 'filter[type]', filterValue: 'Missile' } },
      { id: 'miss-l',   label: 'LAUNCHERS',   query: { filterKey: 'filter[type]', filterValue: 'MissileLauncher' } },
      { id: 'bomb',     label: 'BOMBS',       query: { filterKey: 'filter[type]', filterValue: 'Bomb' } },
      { id: 'bomb-l',   label: 'BOMB LAUNCH', query: { filterKey: 'filter[type]', filterValue: 'BombLauncher' } },
      { id: 'shield',   label: 'SHIELDS',     query: { filterKey: 'filter[type]', filterValue: 'Shield' } },
      { id: 'power',    label: 'POWER',       query: { filterKey: 'filter[type]', filterValue: 'PowerPlant' } },
      { id: 'cooler',   label: 'COOLERS',     query: { filterKey: 'filter[type]', filterValue: 'Cooler' } },
      { id: 'qd',       label: 'Q-DRIVE',     query: { filterKey: 'filter[type]', filterValue: 'QuantumDrive' } },
      { id: 'thrust',   label: 'THRUSTERS',   query: { filterKey: 'filter[type]', filterValue: 'MainThruster' } },
      { id: 'lsg',      label: 'LIFE SUPPORT',query: { filterKey: 'filter[type]', filterValue: 'LifeSupportGenerator' } },
      { id: 'mining',   label: 'MINING',      query: { filterKey: 'filter[type]', filterValue: 'MiningModifier' } },
      { id: 'salvage',  label: 'SALVAGE',     query: { filterKey: 'filter[type]', filterValue: 'SalvageHead' } }
    ]
  }
]

// ─── Helpers ──────────────────────────────────────────────────────────────

function sanitizeString(value: string | null | undefined): string | null {
  if (!value || value.toLowerCase() === 'undefined') return null
  return value
}

function extractSlot(item: WikiArmorItem): string | null {
  if (item.clothing?.slot) return item.clothing.slot
  if (!item.classification) return null
  const parts = item.classification.split('.')
  const last = parts[parts.length - 1]
  return last && last !== item.classification ? last : null
}

function formatPrice(value: number | null | undefined): string {
  if (!value || value === 0) return '–'
  return value.toLocaleString('en-US') + ' aUEC'
}

// ─── Terminal name helpers ────────────────────────────────────────────────

const SYSTEM_COLORS: Record<string, { text: string; border: string; bg: string }> = {
  stanton: { text: 'text-hud-cyan',   border: 'border-hud-cyan/40',   bg: 'bg-hud-cyan/10'   },
  nyx:     { text: 'text-[#a060ff]',  border: 'border-[#a060ff]/40',  bg: 'bg-[#a060ff]/10'  },
  pyro:    { text: 'text-[#e86030]',  border: 'border-[#e86030]/40',  bg: 'bg-[#e86030]/10'  },
}

function parseTerminalName(raw: string): { name: string; system: string | null } {
  const systemMatch = raw.match(/\(([^)]+)\)\s*$/)
  const system = systemMatch ? systemMatch[1] : null
  const withoutSystem = systemMatch ? raw.slice(0, systemMatch.index).trim() : raw
  const name = withoutSystem.replace(/fps\s+armor\s*/gi, '').trim()
  return { name, system }
}

function SystemBadge({ system }: { system: string }) {
  const key = system.toLowerCase()
  const colors = SYSTEM_COLORS[key] ?? { text: 'text-hud-muted', border: 'border-hud-border', bg: 'bg-transparent' }
  return (
    <span className={`hud-label px-1.5 py-0.5 border whitespace-nowrap ${colors.text} ${colors.border} ${colors.bg}`}>
      {system}
    </span>
  )
}

// ─── Item detail dialog ───────────────────────────────────────────────────

function EquipmentDetailDialog({
  item,
  accent,
  onClose
}: {
  item: WikiArmorItem
  accent: string
  onClose: () => void
}) {
  const slot = extractSlot(item)
  const shops = item.uex_prices.filter((p) => p.price_buy > 0 || (p.price_sell ?? 0) > 0)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      variants={BACKDROP_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="w-full max-w-4xl bg-hud-panel border border-hud-border flex flex-col max-h-[88vh]"
        style={{ boxShadow: `0 0 40px color-mix(in srgb, ${accent} 8%, transparent)` }}
        variants={MODAL_VARIANTS}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-hud-border shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 shrink-0" style={{ background: accent }} />
            <span className="hud-label text-hud-text tracking-widest">ITEM DETAIL</span>
          </div>
          <button onClick={onClose} className="text-hud-muted hover:text-hud-red transition-colors p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body: left content + right image panel */}
        <div className="flex flex-1 min-h-0">

          {/* Left — scrollable content */}
          <div className="flex-1 min-w-0 overflow-y-auto scrollbar-hud p-5 space-y-5">

            {/* Name + tags */}
            <div>
              <p className="font-mono text-base font-bold text-hud-text tracking-wide leading-tight">
                {item.name}
              </p>
              <p className="hud-label text-hud-muted mt-1">
                {item.manufacturer?.name ?? '–'}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {item.size != null && (
                  <span
                    className="hud-label px-2 py-0.5 border font-bold"
                    style={{ color: accent, borderColor: `${accent}50`, background: `${accent}12` }}
                  >
                    SIZE {item.size}
                  </span>
                )}
                {sanitizeString(item.sub_type) && <Badge variant="secondary">{sanitizeString(item.sub_type)}</Badge>}
                {slot && <Badge variant="outline">{slot}</Badge>}
                {item.grade && <Badge variant="outline">GRADE {item.grade}</Badge>}
                {item.class && <Badge variant="outline">{item.class}</Badge>}
              </div>
            </div>

            {/* Description */}
            {item.description?.en_EN && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="hud-label text-hud-muted">DESCRIPTION</span>
                  <div className="flex-1 h-px bg-hud-border" />
                </div>
                <p
                  className="text-xs text-hud-dim leading-relaxed border-l-2 pl-3"
                  style={{ borderColor: `${accent}50` }}
                >
                  {item.description.en_EN}
                </p>
              </div>
            )}

            {/* Terminals */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-3 w-3 text-hud-muted" />
                <span className="hud-label text-hud-muted">WHERE TO BUY</span>
                <div className="flex-1 h-px bg-hud-border" />
              </div>

              {shops.length === 0 ? (
                <div className="flex items-center gap-2 py-3">
                  <Package className="h-3.5 w-3.5 text-hud-dim" />
                  <span className="hud-label text-hud-dim">No known shops for this item</span>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-hud-border">
                      <th className="hud-label text-hud-dim font-normal text-left pb-1.5 pl-2 pr-3">TERMINAL</th>
                      <th className="hud-label text-hud-dim font-normal text-right pb-1.5 pr-3 w-32">BUY</th>
                      <th className="hud-label text-hud-dim font-normal text-right pb-1.5 w-20">SYSTEM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shops.map((shop) => {
                      const { name, system } = parseTerminalName(shop.terminal_name)
                      return (
                        <tr key={shop.terminal_id} className="border-b border-hud-border/40 hover:bg-hud-deep/40 transition-colors">
                          <td className="hud-label text-hud-text py-1.5 pl-2 pr-3 truncate max-w-0" title={name}>
                            {name}
                          </td>
                          <td className="font-mono text-xs text-hud-green text-right py-1.5 pr-3 whitespace-nowrap">
                            {formatPrice(shop.price_buy)}
                          </td>
                          <td className="text-right py-1.5 whitespace-nowrap">
                            {system
                              ? <SystemBadge system={system} />
                              : <span className="hud-label text-hud-dim">–</span>
                            }
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right — image panel */}
          <div className="w-52 shrink-0 border-l border-hud-border flex flex-col">

            {/* Image area — fills top, dark with scanline */}
            <div
              className="relative flex-1 flex items-center justify-center bg-black/60 overflow-hidden"
              style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 3px, rgba(255,255,255,0.015) 3px, rgba(255,255,255,0.015) 4px)' }}
            >
              {/* Corner accents */}
              <span className="absolute top-2 left-2 w-4 h-px" style={{ background: accent, opacity: 0.7 }} />
              <span className="absolute top-2 left-2 h-4 w-px" style={{ background: accent, opacity: 0.7 }} />
              <span className="absolute bottom-2 right-2 w-4 h-px" style={{ background: accent, opacity: 0.7 }} />
              <span className="absolute bottom-2 right-2 h-4 w-px" style={{ background: accent, opacity: 0.7 }} />

              <EquipmentImage itemName={item.name} category="armor" size={160} eager />
            </div>

            {/* Metadata footer */}
            <div className="border-t border-hud-border bg-hud-deep/60 p-3 space-y-2 shrink-0">
              {item.size != null && (
                <div className="flex items-center justify-between">
                  <span className="hud-label text-hud-dim">SIZE</span>
                  <span
                    className="hud-label px-1.5 py-0.5 border font-bold"
                    style={{ color: accent, borderColor: `${accent}40`, background: `${accent}10` }}
                  >
                    S{item.size}
                  </span>
                </div>
              )}
              {item.manufacturer && (
                <div className="flex items-center justify-between">
                  <span className="hud-label text-hud-dim">MFR</span>
                  <span
                    className="hud-label px-1.5 py-0.5 border font-bold"
                    style={{ color: accent, borderColor: `${accent}40`, background: `${accent}10` }}
                  >
                    {item.manufacturer.code}
                  </span>
                </div>
              )}
              {item.version && (
                <div className="flex items-center justify-between">
                  <span className="hud-label text-hud-dim">VERSION</span>
                  <span className="hud-label text-hud-muted">{item.version.replace(/-LIVE.*$/, '')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-3 border-t border-hud-border shrink-0">
          <button
            onClick={onClose}
            className="flex-1 h-9 border border-hud-border text-hud-muted font-mono text-xs
              tracking-widest uppercase hover:border-hud-border-glow hover:text-hud-text
              transition-all duration-150"
          >
            CLOSE
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Equipment card ───────────────────────────────────────────────────────

function EquipmentCard({
  item,
  accent,
  onClick
}: {
  item: WikiArmorItem
  accent: string
  onClick: () => void
}) {
  const slot = extractSlot(item)

  return (
    <div
      className="hud-panel relative transition-colors duration-150 cursor-pointer hover:border-hud-border-glow"
      onClick={onClick}
    >
      <span className="absolute top-0 left-0 w-4 h-px" style={{ background: accent, opacity: 0.6 }} />
      <span className="absolute top-0 left-0 h-4 w-px" style={{ background: accent, opacity: 0.6 }} />

      <div className="flex gap-3 p-3">
        <EquipmentImage itemName={item.name} category="armor" size={80} />

        <div className="flex flex-col justify-between min-w-0 flex-1 py-0.5">
          <div>
            <p className="font-mono text-sm font-bold text-hud-text tracking-wide truncate">
              {item.name}
            </p>
            <p className="hud-label text-hud-muted mt-0.5 truncate">
              {item.manufacturer?.name ?? '–'}
            </p>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {item.size != null && (
              <span
                className="hud-label px-1.5 py-0 border font-bold"
                style={{ color: accent, borderColor: `${accent}50`, background: `${accent}12` }}
              >
                S{item.size}
              </span>
            )}
            {sanitizeString(item.sub_type) && <Badge variant="secondary">{sanitizeString(item.sub_type)}</Badge>}
            {slot && <Badge variant="outline">{slot}</Badge>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton card ────────────────────────────────────────────────────────

function EquipmentCardSkeleton() {
  return (
    <div className="hud-panel p-3 flex gap-3">
      <Skeleton className="shrink-0" style={{ width: 80, height: 80 }} />
      <div className="flex-1 space-y-2 py-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-1 mt-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
      </div>
    </div>
  )
}

// ─── SubTabBar ────────────────────────────────────────────────────────────

interface SubTabBarProps {
  tabs: SubTabConfig[]
  activeId: string
  accent: string
  onSelect: (id: string) => void
}

function SubTabBar({ tabs, activeId, accent, onSelect }: SubTabBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' })
  }

  return (
    <div className="relative flex items-center shrink-0 border-b border-hud-border">
      <button
        onClick={() => scroll('left')}
        className="shrink-0 px-1.5 py-2 text-hud-dim hover:text-hud-text transition-colors"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto px-1 py-1.5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
      >
        {tabs.map((sub) => {
          const isActive = sub.id === activeId
          return (
            <button
              key={sub.id}
              onClick={() => onSelect(sub.id)}
              className="px-3 py-0.5 hud-label whitespace-nowrap shrink-0 rounded-sm border transition-colors duration-150"
              style={isActive ? {
                color: accent,
                borderColor: `${accent}50`,
                background: `${accent}15`
              } : { borderColor: 'transparent', color: 'var(--hud-dim)' }}
            >
              {sub.label}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => scroll('right')}
        className="shrink-0 px-1.5 py-2 text-hud-dim hover:text-hud-text transition-colors"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10

export function EquipmentView() {
  const [activeTabId, setActiveTabId] = useState<string>('fps-armor')
  const [activeSubTabIds, setActiveSubTabIds] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [filterBrand, setFilterBrand] = useState('')
  const [filterSlot, setFilterSlot] = useState('')
  const [filterSubType, setFilterSubType] = useState('')
  const [filterSize, setFilterSize] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageInput, setPageInput] = useState('')
  const [selectedItem, setSelectedItem] = useState<WikiArmorItem | null>(null)
  const [isClearing, setIsClearing] = useState(false)
  const queryClient = useQueryClient()

  const activeMainTab = MAIN_TABS.find((t) => t.id === activeTabId)!
  const hasSubTabs = activeMainTab.subTabs.length > 1
  const activeSubTabId = activeSubTabIds[activeTabId] ?? activeMainTab.subTabs[0].id
  const activeSubTab = activeMainTab.subTabs.find((s) => s.id === activeSubTabId) ?? activeMainTab.subTabs[0]

  const { items, totalInApi, isLoading, isFetchingMore, isFullyLoaded } = useWikiItems(
    activeSubTab.query
  )

  const { brands, slots, subTypes, sizes } = useMemo(() => {
    const brandSet = new Set<string>()
    const slotSet = new Set<string>()
    const subTypeSet = new Set<string>()
    const sizeSet = new Set<number>()
    for (const item of items) {
      if (item.manufacturer?.name) brandSet.add(item.manufacturer.name)
      const slot = extractSlot(item)
      if (slot && slot !== '–') slotSet.add(slot)
      const subType = sanitizeString(item.sub_type)
      if (subType) subTypeSet.add(subType)
      if (item.size != null) sizeSet.add(item.size)
    }
    return {
      brands: Array.from(brandSet).sort(),
      slots: Array.from(slotSet).sort(),
      subTypes: Array.from(subTypeSet).sort(),
      sizes: Array.from(sizeSet).sort((a, b) => a - b).map(String)
    }
  }, [items])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filterBrand && item.manufacturer?.name !== filterBrand) return false
      if (filterSlot && extractSlot(item) !== filterSlot) return false
      if (filterSubType && sanitizeString(item.sub_type) !== filterSubType) return false
      if (filterSize && String(item.size ?? '') !== filterSize) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return (
          item.name.toLowerCase().includes(q) ||
          item.manufacturer?.name.toLowerCase().includes(q) ||
          sanitizeString(item.sub_type)?.toLowerCase().includes(q) ||
          extractSlot(item)?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [items, search, filterBrand, filterSlot, filterSubType, filterSize])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const pageItems = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  function goToPage(page: number) {
    const clamped = Math.min(Math.max(1, page), totalPages)
    setCurrentPage(clamped)
    setPageInput('')
  }

  function resetPage() {
    setCurrentPage(1)
    setPageInput('')
  }

  function resetFilters() {
    setSearch('')
    setFilterBrand('')
    setFilterSlot('')
    setFilterSubType('')
    setFilterSize('')
    resetPage()
  }

  async function handleClearImageCache() {
    setIsClearing(true)
    await window.api.imageCache.clear()
    queryClient.removeQueries({ queryKey: ['equipmentImage'] })
    setIsClearing(false)
  }

  function switchMainTab(tabId: string) {
    setActiveTabId(tabId)
    resetFilters()
  }

  function switchSubTab(subTabId: string) {
    setActiveSubTabIds((prev) => ({ ...prev, [activeTabId]: subTabId }))
    resetFilters()
  }

  function buildStatusLabel(): string {
    if (isLoading) return 'LOADING...'
    const label = `${activeMainTab.label} · ${activeSubTab.label}`
    if (!isFullyLoaded) return `${items.length} / ${totalInApi} ${label} LOADING...`
    return `${items.length} ${label} ITEMS`
  }

  return (
    <div className="flex flex-col h-full w-full p-5 gap-4">

      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-3 border"
        style={{ borderColor: `${activeMainTab.accent}33` }}
      >
        <div className="flex items-center gap-3">
          <Shield
            className="h-5 w-5 drop-shadow-[0_0_4px_currentColor]"
            style={{ color: activeMainTab.accent }}
          />
          <div>
            <h1
              className="font-mono text-sm font-bold tracking-[0.15em] uppercase"
              style={{ color: activeMainTab.accent, textShadow: `0 0 8px ${activeMainTab.accent}66` }}
            >
              Equipment Database
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="hud-label text-hud-muted">{buildStatusLabel()}</p>
              {isFetchingMore && (
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full animate-pulse"
                  style={{ background: activeMainTab.accent }}
                />
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="group relative">
            <Heart className="h-3.5 w-3.5 text-hud-dim hover:text-pink-400 transition-colors cursor-default" fill="currentColor" />
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block pointer-events-none">
              <div className="bg-hud-panel border border-hud-border px-2.5 py-1.5 whitespace-nowrap">
                <p className="font-mono text-[0.6rem] tracking-widest text-hud-muted">
                  Thanks to <span className="text-pink-400">Ther91</span> for the idea ♥
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="hud-ghost"
            size="icon"
            title="Clear image cache"
            disabled={isClearing}
            onClick={handleClearImageCache}
            className="border-hud-border text-hud-muted hover:text-hud-text hover:border-hud-text/40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isClearing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Main tab bar */}
      <div className="flex border-b border-hud-border overflow-x-auto scrollbar-none shrink-0">
        {MAIN_TABS.map((tab) => {
          const isActive = tab.id === activeTabId
          return (
            <button
              key={tab.id}
              onClick={() => switchMainTab(tab.id)}
              className="relative px-4 py-2 hud-label transition-colors duration-150 whitespace-nowrap shrink-0"
              style={{ color: isActive ? tab.accent : undefined }}
            >
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-px"
                  style={{ background: tab.accent, boxShadow: `0 0 6px ${tab.accent}` }}
                />
              )}
              <span className={isActive ? '' : 'text-hud-muted hover:text-hud-text'}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Sub-tab bar — only when active tab has multiple sub-types */}
      {hasSubTabs && <SubTabBar
        tabs={activeMainTab.subTabs}
        activeId={activeSubTabId}
        accent={activeMainTab.accent}
        onSelect={switchSubTab}
      />}

      {/* Search */}
      <div className="relative shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-hud-muted" />
        <Input
          className="pl-8 h-8"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); resetPage() }}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 shrink-0">
        {[
          { label: 'BRAND', value: filterBrand,   options: brands,    set: setFilterBrand   },
          { label: 'SLOT',  value: filterSlot,     options: slots,     set: setFilterSlot    },
          { label: 'TYPE',  value: filterSubType,  options: subTypes,  set: setFilterSubType },
          { label: 'SIZE',  value: filterSize,     options: sizes,     set: setFilterSize,   narrow: true }
        ].map(({ label, value, options, set, narrow }) => (
          options.length === 0 ? null : (
            <div key={label} className={`relative ${narrow ? 'w-20 shrink-0' : 'flex-1'}`}>
              <select
                value={value}
                onChange={(e) => { set(e.target.value); resetPage() }}
                className="w-full h-8 pl-2 pr-6 border border-hud-border bg-hud-panel font-mono text-[0.6rem]
                  tracking-widest text-hud-muted focus:outline-none focus:border-hud-accent
                  appearance-none cursor-pointer transition-colors hover:border-hud-border-glow"
                style={{ borderColor: value ? `${activeMainTab.accent}60` : undefined,
                         color: value ? activeMainTab.accent : undefined }}
              >
                <option value="">{label}</option>
                {options.map((o) => (
                  <option key={o} value={o}>S{o}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-hud-muted text-[0.5rem]">▼</span>
            </div>
          )
        ))}
        {(filterBrand || filterSlot || filterSubType || filterSize) && (
          <button
            onClick={resetFilters}
            className="hud-label text-hud-muted hover:text-hud-red transition-colors px-2 shrink-0"
            title="Clear filters"
          >
            ✕
          </button>
        )}
      </div>

      <hr className="hud-divider" />

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 overflow-y-auto scrollbar-hud">
          {Array.from({ length: 6 }).map((_, i) => (
            <EquipmentCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3">
          <div className="border border-hud-border bg-hud-blue/5 p-8">
            <Shield
              className="h-12 w-12 mx-auto mb-3 opacity-20"
              style={{ color: activeMainTab.accent }}
            />
            <p className="hud-label text-center" style={{ color: activeMainTab.accent }}>
              NO ITEMS FOUND
            </p>
            {search && (
              <p className="hud-label text-hud-muted text-center mt-1">No results for "{search}"</p>
            )}
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTabId}-${activeSubTabId}-${safePage}`}
            className="grid grid-cols-1 md:grid-cols-2 gap-2 overflow-y-auto scrollbar-hud"
            variants={LIST_VARIANTS}
            initial="initial"
            animate="animate"
          >
            {pageItems.map((item) => (
              <motion.div key={item.uuid} variants={ROW_VARIANTS}>
                <EquipmentCard
                  item={item}
                  accent={activeMainTab.accent}
                  onClick={() => setSelectedItem(item)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex flex-col gap-2 shrink-0 pt-1">

          {/* Slider + input */}
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={totalPages}
              value={safePage}
              onChange={(e) => goToPage(Number(e.target.value))}
              className="hud-slider flex-1"
              style={{
                '--slider-accent': activeMainTab.accent,
                '--slider-pct': `${((safePage - 1) / Math.max(1, totalPages - 1)) * 100}%`
              } as React.CSSProperties}
            />
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const n = parseInt(pageInput, 10)
                if (!isNaN(n)) goToPage(n)
              }}
            >
              <input
                type="text"
                inputMode="numeric"
                value={pageInput !== '' ? pageInput : String(safePage)}
                onChange={(e) => setPageInput(e.target.value)}
                onFocus={() => setPageInput(String(safePage))}
                onBlur={() => {
                  const n = parseInt(pageInput, 10)
                  if (!isNaN(n)) goToPage(n)
                  else setPageInput('')
                }}
                className="w-12 h-7 text-center bg-hud-panel border border-hud-border font-mono text-xs text-hud-text focus:outline-none focus:border-hud-accent"
                style={{ borderColor: pageInput !== '' ? `${activeMainTab.accent}80` : undefined }}
              />
            </form>
            <span className="hud-label text-hud-muted whitespace-nowrap">/ {totalPages}</span>
          </div>

          {/* Prev / Next */}
          <div className="flex items-center justify-between">
            <button
              className="flex items-center gap-1 hud-label text-hud-muted hover:text-hud-text disabled:opacity-30 disabled:pointer-events-none transition-colors"
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              PREV
            </button>

            <span className="hud-label text-hud-dim">{filtered.length} items</span>

            <button
              className="flex items-center gap-1 hud-label text-hud-muted hover:text-hud-text disabled:opacity-30 disabled:pointer-events-none transition-colors"
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
            >
              NEXT
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Detail dialog */}
      <AnimatePresence>
        {selectedItem && (
          <EquipmentDetailDialog
            key={selectedItem.uuid}
            item={selectedItem}
            accent={activeMainTab.accent}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
