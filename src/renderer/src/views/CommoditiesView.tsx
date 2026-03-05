import { useState, useMemo, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Package2,
  X,
  ArrowUp,
  ArrowDown,
  Zap
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCommodityPrices } from '../hooks/useCommodityPrices'
import { useStaticData } from '../hooks/useStaticData'
import { Input } from '../components/ui/input'
import { Skeleton } from '../components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import { formatRelativeTime, cn } from '../lib/utils'
import type { Commodity, CommodityPrice } from '../api/types'

// ── Types ──────────────────────────────────────────────────────────────────

interface CommoditySummary {
  id: number
  code: string
  name: string
  kind: string
  bestSellPrice: number
  avgSellPrice: number
  bestBuyPrice: number
  avgBuyPrice: number
  terminalCount: number
  bestSellTerminal: string | null
  bestBuyTerminal: string | null
}

type KindFilter = string | null

// ── Data aggregation ───────────────────────────────────────────────────────

function buildSummaries(commodities: Commodity[], prices: CommodityPrice[]): CommoditySummary[] {
  const priceMap = new Map<number, CommodityPrice[]>()
  for (const p of prices) {
    const list = priceMap.get(p.id_commodity) ?? []
    list.push(p)
    priceMap.set(p.id_commodity, list)
  }

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)

  return commodities
    .filter((c) => c.is_available === 1 || c.is_available_live === 1)
    .map((c) => {
      const rows = priceMap.get(c.id) ?? []
      const sellRows = rows.filter((r) => r.price_sell > 0)
      const buyRows = rows.filter((r) => r.price_buy > 0)
      const sellPrices = sellRows.map((r) => r.price_sell)
      const sellAvgs = rows.filter((r) => r.price_sell_avg > 0).map((r) => r.price_sell_avg)
      const buyPrices = buyRows.map((r) => r.price_buy)
      const buyAvgs = rows.filter((r) => r.price_buy_avg > 0).map((r) => r.price_buy_avg)

      const bestSellPrice = sellPrices.length ? Math.max(...sellPrices) : 0
      const bestBuyPrice = buyPrices.length ? Math.min(...buyPrices) : 0
      const bestSellRow = sellRows.find((r) => r.price_sell === bestSellPrice) ?? null
      const bestBuyRow = buyRows.find((r) => r.price_buy === bestBuyPrice) ?? null

      return {
        id: c.id,
        code: c.code,
        name: c.name,
        kind: c.kind || 'Other',
        bestSellPrice,
        avgSellPrice: avg(sellAvgs),
        bestBuyPrice,
        avgBuyPrice: avg(buyAvgs),
        terminalCount: rows.length,
        bestSellTerminal: bestSellRow?.terminal_name ?? null,
        bestBuyTerminal: bestBuyRow?.terminal_name ?? null
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

function groupBySystemAndPlanet(rows: CommodityPrice[]): [string, [string, CommodityPrice[]][]][] {
  const systemMap = new Map<string, Map<string, CommodityPrice[]>>()

  for (const row of rows) {
    const system = row.star_system_name ?? 'Unknown'
    const planet = row.planet_name ?? 'Unknown'

    if (!systemMap.has(system)) systemMap.set(system, new Map())
    const planetMap = systemMap.get(system)!
    if (!planetMap.has(planet)) planetMap.set(planet, [])
    planetMap.get(planet)!.push(row)
  }

  return [...systemMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([system, planetMap]) => [
      system,
      [...planetMap.entries()].sort(([a], [b]) => a.localeCompare(b))
    ])
}

// ── Price value display ────────────────────────────────────────────────────

function PriceValue({ current, avg, isBuy }: { current: number; avg: number; isBuy?: boolean }) {
  if (!current) {
    return <span className="font-mono text-xs text-hud-muted tabular-nums text-right">—</span>
  }

  const isGood = isBuy ? current <= avg : current >= avg
  const Icon = isGood ? TrendingUp : TrendingDown
  const colorClass = isGood ? 'text-hud-green' : 'text-hud-red'

  return (
    <span className={cn('flex items-center justify-end gap-0.5 font-mono text-xs tabular-nums', colorClass)}>
      <Icon className="h-2.5 w-2.5 shrink-0" />
      {current.toLocaleString('en-US')}
    </span>
  )
}

// ── Spread indicator ───────────────────────────────────────────────────────

function SpreadIndicator({
  spread,
  spreadPct,
  relativeWidth
}: {
  spread: number
  spreadPct: number
  relativeWidth: number
}) {
  const isPositive = spread > 0
  const Icon = isPositive ? TrendingUp : TrendingDown

  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className={cn('flex items-center gap-0.5', isPositive ? 'text-hud-green' : 'text-hud-red')}>
        <Icon className="h-2.5 w-2.5 shrink-0" />
        <span className="font-mono tabular-nums" style={{ fontSize: '9px' }}>
          {spreadPct > 0 ? `+${spreadPct.toFixed(0)}%` : `${spreadPct.toFixed(0)}%`}
        </span>
      </div>
      <div className="w-8 h-[3px] bg-hud-border overflow-hidden">
        <div
          className={cn('h-full', isPositive ? 'bg-hud-green/70' : 'bg-hud-red/60')}
          style={{ width: `${relativeWidth}%` }}
        />
      </div>
    </div>
  )
}

// ── Filter chip ────────────────────────────────────────────────────────────

function FilterChip({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 px-2.5 py-0.5 hud-label tracking-widest border transition-colors duration-100',
        isActive
          ? 'text-hud-cyan border-hud-cyan/50 bg-hud-cyan/10'
          : 'text-hud-muted border-hud-border hover:text-hud-text'
      )}
      style={{ fontSize: '9px' }}
    >
      {label}
    </button>
  )
}

// ── Filter bar ─────────────────────────────────────────────────────────────

function FilterBar({
  kinds,
  selected,
  onSelect
}: {
  kinds: string[]
  selected: KindFilter
  onSelect: (k: KindFilter) => void
}) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap gap-1.5 px-3 py-2 overflow-x-hidden scrollbar-hud shrink-0 border-b border-hud-border">
      <FilterChip
        label={t('commodities.filter.all')}
        isActive={selected === null}
        onClick={() => onSelect(null)}
      />
      {kinds.map((k) => (
        <FilterChip
          key={k}
          label={k.toUpperCase()}
          isActive={selected === k}
          onClick={() => onSelect(k)}
        />
      ))}
    </div>
  )
}

// ── Commodity row ──────────────────────────────────────────────────────────

function CommodityRow({
  summary,
  isSelected,
  maxSpread,
  onClick
}: {
  summary: CommoditySummary
  isSelected: boolean
  maxSpread: number
  onClick: () => void
}) {
  const spread = summary.bestSellPrice - summary.bestBuyPrice
  const spreadPct = summary.bestBuyPrice > 0 ? (spread / summary.bestBuyPrice) * 100 : 0
  const relativeWidth = maxSpread > 0 ? Math.min(100, Math.max(0, (spread / maxSpread) * 100)) : 0

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full grid items-center px-3 py-1.5 border-l-2 transition-colors duration-100',
        'hover:bg-hud-deep/60 text-left',
        isSelected ? 'border-hud-cyan bg-hud-cyan/5' : 'border-transparent'
      )}
      style={{ gridTemplateColumns: '3rem 1fr 3.5rem 5rem 5rem' }}
    >
      <span className="font-mono text-xs text-hud-muted tracking-wide">{summary.code}</span>
      <span className="text-xs text-hud-text truncate pr-2">{summary.name}</span>
      {spread > 0 ? (
        <SpreadIndicator spread={spread} spreadPct={spreadPct} relativeWidth={relativeWidth} />
      ) : (
        <span className="flex justify-end">
          <span className="font-mono text-[10px] text-hud-dim">—</span>
        </span>
      )}
      <PriceValue current={summary.bestSellPrice} avg={summary.avgSellPrice} />
      <PriceValue current={summary.bestBuyPrice} avg={summary.avgBuyPrice} isBuy />
    </button>
  )
}

// ── List column headers ────────────────────────────────────────────────────

function ListColumnHeaders() {
  const { t } = useTranslation()

  return (
    <div
      className="grid px-3 py-1.5 border-b border-hud-border shrink-0"
      style={{ gridTemplateColumns: '3rem 1fr 3.5rem 5rem 5rem' }}
    >
      <span className="hud-label text-hud-dim" style={{ fontSize: '9px' }} />
      <span className="hud-label text-hud-dim" style={{ fontSize: '9px' }}>{t('commodities.col.name')}</span>
      <span className="hud-label text-hud-dim text-right" style={{ fontSize: '9px' }}>{t('commodities.col.spread')}</span>
      <span className="hud-label text-hud-dim text-right" style={{ fontSize: '9px' }}>{t('commodities.col.sell')}</span>
      <span className="hud-label text-hud-dim text-right" style={{ fontSize: '9px' }}>{t('commodities.col.buy')}</span>
    </div>
  )
}

// ── List skeleton ──────────────────────────────────────────────────────────

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-0.5 px-4 pt-3">
      {Array.from({ length: 25 }).map((_, i) => (
        <Skeleton key={i} className="h-7 w-full" />
      ))}
    </div>
  )
}

// ── Market list (left panel) ───────────────────────────────────────────────

function MarketList({
  summaries,
  isReady,
  isFetching,
  cooldown,
  search,
  selectedId,
  onSearchChange,
  onSelect,
  onRefresh
}: {
  summaries: CommoditySummary[]
  isReady: boolean
  isFetching: boolean
  cooldown: number
  search: string
  selectedId: number | null
  onSearchChange: (v: string) => void
  onSelect: (s: CommoditySummary) => void
  onRefresh: () => void
}) {
  const { t } = useTranslation()
  const [kindFilter, setKindFilter] = useState<KindFilter>(null)

  const kinds = useMemo(
    () => [...new Set(summaries.map((s) => s.kind))].sort(),
    [summaries]
  )

  const filtered = useMemo(() => {
    if (kindFilter === null) return summaries
    return summaries.filter((s) => s.kind === kindFilter)
  }, [summaries, kindFilter])

  const maxSpread = useMemo(() => {
    const spreads = filtered
      .map((s) => s.bestSellPrice - s.bestBuyPrice)
      .filter((v) => v > 0)
    return spreads.length ? Math.max(...spreads) : 0
  }, [filtered])

  return (
    <div className="flex flex-col w-[35%] border-r border-hud-border shrink-0 min-h-0">
      {/* Search + refresh */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-hud-border shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-hud-muted pointer-events-none" />
          <Input
            placeholder={t('commodities.searchPlaceholder')}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-7 h-7 text-xs"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isReady && (
            <span className="hud-label text-hud-muted" style={{ fontSize: '10px' }}>
              {filtered.length}
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={cooldown > 0}
            className="flex items-center gap-1 hud-label text-hud-muted hover:text-hud-text disabled:opacity-40 transition-colors"
            style={{ fontSize: '10px' }}
          >
            <RefreshCw className={cn('h-3 w-3', isFetching && 'animate-spin')} />
            {cooldown > 0 ? `${cooldown}s` : t('commodities.refresh').toUpperCase()}
          </button>
        </div>
      </div>

      {/* Filter chips */}
      {isReady && kinds.length > 0 && (
        <FilterBar kinds={kinds} selected={kindFilter} onSelect={setKindFilter} />
      )}

      {/* Column headers */}
      {isReady && <ListColumnHeaders />}

      {/* Flat list */}
      <div className="flex-1 overflow-auto scrollbar-hud">
        {!isReady ? (
          <ListSkeleton />
        ) : filtered.length === 0 ? (
          <p className="text-center text-hud-muted text-xs py-12">{t('commodities.noResults')}</p>
        ) : (
          filtered.map((s) => (
            <CommodityRow
              key={s.id}
              summary={s}
              isSelected={selectedId === s.id}
              maxSpread={maxSpread}
              onClick={() => onSelect(s)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ── Top card ───────────────────────────────────────────────────────────────

function TopCard({
  label,
  icon,
  value,
  sub,
  colorClass
}: {
  label: string
  icon: ReactNode
  value: string
  sub?: string
  colorClass: string
}) {
  return (
    <div className="flex-1 px-3 py-2.5 border border-hud-border bg-hud-deep/40 flex flex-col gap-1 min-w-0">
      <div className={cn('flex items-center gap-1.5', colorClass)}>
        <span className="shrink-0">{icon}</span>
        <span className="hud-label tracking-widest truncate" style={{ fontSize: '9px' }}>{label}</span>
      </div>
      <span className={cn('font-mono text-sm font-semibold tabular-nums', colorClass)}>{value}</span>
      {sub && (
        <p className="text-hud-muted truncate" style={{ fontSize: '10px' }}>{sub}</p>
      )}
    </div>
  )
}

// ── Hierarchical terminal row ──────────────────────────────────────────────

function HierarchicalTerminalRow({
  row,
  tab,
  maxScu
}: {
  row: CommodityPrice
  tab: 'sell' | 'buy'
  maxScu: number
}) {
  const price = tab === 'buy' ? row.price_buy : row.price_sell
  const scu = tab === 'buy' ? row.scu_buy : row.scu_sell
  const priceColorClass = tab === 'sell' ? 'text-hud-green' : 'text-hud-amber'
  const scuWidth = maxScu > 0 ? Math.min(100, (scu / maxScu) * 100) : 0

  return (
    <div
      className="grid items-center px-4 pl-10 py-1.5 border-b border-hud-border/30 hover:bg-hud-deep/50 transition-colors"
      style={{ gridTemplateColumns: '1fr 7rem 6rem 4.5rem' }}
    >
      <span className="font-mono text-xs text-hud-text truncate pr-3">{row.terminal_name}</span>

      <div className="flex flex-col items-end gap-0.5">
        <span className="font-mono text-[10px] text-hud-muted tabular-nums">
          {scu > 0 ? `${scu.toLocaleString('en-US')} SCU` : '—'}
        </span>
        {scu > 0 && (
          <div className="w-14 h-[2px] bg-hud-border overflow-hidden">
            <div className="h-full bg-hud-cyan/50" style={{ width: `${scuWidth}%` }} />
          </div>
        )}
      </div>

      <span
        className={cn('font-mono text-xs text-right tabular-nums', price > 0 ? priceColorClass : 'text-hud-muted')}
      >
        {price > 0 ? `${price.toLocaleString('en-US')} aUEC` : '—'}
      </span>

      <span className="text-hud-muted text-right whitespace-nowrap" style={{ fontSize: '10px' }}>
        {row.date_modified ? formatRelativeTime(row.date_modified * 1000) : '—'}
      </span>
    </div>
  )
}

// ── Terminal hierarchy ─────────────────────────────────────────────────────

function TerminalHierarchy({ rows, tab }: { rows: CommodityPrice[]; tab: 'sell' | 'buy' }) {
  const maxScu = useMemo(() => {
    const all = rows.map((r) => (tab === 'sell' ? r.scu_sell : r.scu_buy))
    return Math.max(...all, 1)
  }, [rows, tab])

  const groups = useMemo(() => groupBySystemAndPlanet(rows), [rows])

  return (
    <div className="flex flex-col">
      {groups.map(([system, planets]) => (
        <div key={system}>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-hud-deep/80 border-b border-hud-border/60 sticky top-0 z-10">
            <span className="hud-label text-hud-cyan tracking-widest" style={{ fontSize: '9px' }}>
              {system.toUpperCase()}
            </span>
          </div>
          {planets.map(([planet, terminals]) => (
            <div key={planet}>
              <div className="flex items-center gap-2 px-4 pl-7 py-0.5 bg-hud-panel/50 border-b border-hud-border/40">
                <span className="hud-label text-hud-muted tracking-wider" style={{ fontSize: '9px' }}>
                  {planet.toUpperCase()}
                </span>
                <span className="hud-label text-hud-dim" style={{ fontSize: '9px' }}>
                  {terminals.length}
                </span>
              </div>
              {terminals.map((row) => (
                <HierarchicalTerminalRow key={row.id} row={row} tab={tab} maxScu={maxScu} />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Detail panel — empty state ─────────────────────────────────────────────

function DetailEmpty() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-3 text-hud-muted">
      <Package2 className="h-8 w-8 opacity-20" />
      <p className="hud-label tracking-widest" style={{ fontSize: '10px' }}>
        {t('commodities.selectHint').toUpperCase()}
      </p>
    </div>
  )
}

// ── Detail panel — active state ────────────────────────────────────────────

function DetailActive({
  summary,
  prices,
  onClose
}: {
  summary: CommoditySummary
  prices: CommodityPrice[]
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<'sell' | 'buy'>('sell')

  const rows = useMemo(
    () => prices.filter((p) => p.id_commodity === summary.id),
    [prices, summary.id]
  )

  const sellRows = useMemo(
    () => rows.filter((r) => r.price_sell > 0).sort((a, b) => b.price_sell - a.price_sell),
    [rows]
  )

  const buyRows = useMemo(
    () => rows.filter((r) => r.price_buy > 0).sort((a, b) => a.price_buy - b.price_buy),
    [rows]
  )

  const displayRows = tab === 'sell' ? sellRows : buyRows

  const bestSellRow = sellRows[0] ?? null
  const bestBuyRow = buyRows[0] ?? null
  const margin = (bestSellRow?.price_sell ?? 0) - (bestBuyRow?.price_buy ?? 0)
  const marginPct =
    bestBuyRow?.price_buy && bestBuyRow.price_buy > 0
      ? ((margin / bestBuyRow.price_buy) * 100).toFixed(1)
      : null

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-hud-border shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-sm font-semibold text-hud-cyan shrink-0">{summary.code}</span>
          <span className="text-xs text-hud-text truncate">{summary.name}</span>
          {summary.terminalCount > 0 && (
            <span className="hud-label text-hud-muted shrink-0" style={{ fontSize: '10px' }}>
              {t('commodities.detail.terminals', { count: summary.terminalCount })}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-hud-muted hover:text-hud-text transition-colors p-1 -mr-1 shrink-0"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Top cards */}
      <div className="flex gap-2 px-4 py-3 shrink-0 border-b border-hud-border">
        <TopCard
          label={t('commodities.card.bestSell')}
          icon={<ArrowUp className="h-3 w-3" />}
          value={bestSellRow ? `${bestSellRow.price_sell.toLocaleString('en-US')} aUEC` : '—'}
          sub={bestSellRow?.terminal_name ?? undefined}
          colorClass="text-hud-green"
        />
        <TopCard
          label={t('commodities.card.bestBuy')}
          icon={<ArrowDown className="h-3 w-3" />}
          value={bestBuyRow ? `${bestBuyRow.price_buy.toLocaleString('en-US')} aUEC` : '—'}
          sub={bestBuyRow?.terminal_name ?? undefined}
          colorClass="text-hud-amber"
        />
        <TopCard
          label={t('commodities.card.margin')}
          icon={<Zap className="h-3 w-3" />}
          value={margin > 0 ? `${margin.toLocaleString('en-US')} aUEC` : '—'}
          sub={marginPct ? `+${marginPct}%` : undefined}
          colorClass={margin > 0 ? 'text-hud-cyan' : 'text-hud-muted'}
        />
      </div>

      {/* Tabs + hierarchical table */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as 'sell' | 'buy')} className="flex flex-col flex-1 min-h-0">
        <div className="px-4 pt-2 shrink-0">
          <TabsList>
            <TabsTrigger value="sell">
              {t('commodities.detail.tab.sell')}
              <span className="ml-1.5 font-mono text-[10px]">({sellRows.length})</span>
            </TabsTrigger>
            <TabsTrigger value="buy">
              {t('commodities.detail.tab.buy')}
              <span className="ml-1.5 font-mono text-[10px]">({buyRows.length})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={tab} className="flex flex-col flex-1 min-h-0 pt-0">
          {displayRows.length === 0 ? (
            <p className="text-center text-hud-muted text-xs py-8">
              {t('commodities.detail.noTerminals')}
            </p>
          ) : (
            <div className="flex-1 overflow-auto scrollbar-hud">
              <TerminalHierarchy rows={displayRows} tab={tab} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  )
}

// ── Detail wrapper panel ───────────────────────────────────────────────────

function DetailPanel({
  summary,
  prices,
  onClose
}: {
  summary: CommoditySummary | null
  prices: CommodityPrice[]
  onClose: () => void
}) {
  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
      <AnimatePresence mode="wait">
        {summary ? (
          <motion.div
            key={summary.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.15 } }}
            exit={{ opacity: 0, transition: { duration: 0.08 } }}
            className="flex flex-col flex-1 min-h-0"
          >
            <DetailActive summary={summary} prices={prices} onClose={onClose} />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.15 } }}
            exit={{ opacity: 0, transition: { duration: 0.08 } }}
            className="flex flex-col flex-1 min-h-0"
          >
            <DetailEmpty />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main view ──────────────────────────────────────────────────────────────

export function CommoditiesView() {
  const { commodities, status } = useStaticData()
  const { prices, isFetching, cooldown, refresh } = useCommodityPrices()
  const [search, setSearch] = useState('')
  const [selectedSummary, setSelectedSummary] = useState<CommoditySummary | null>(null)

  const isStaticReady = status === 'ready'

  const summaries = useMemo(
    () => buildSummaries(commodities, prices),
    [commodities, prices]
  )

  const filteredSummaries = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return summaries
    return summaries.filter(
      (s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    )
  }, [summaries, search])

  const handleSelect = (s: CommoditySummary) => {
    setSelectedSummary((prev) => (prev?.id === s.id ? null : s))
  }

  const handleClose = () => setSelectedSummary(null)

  return (
    <div className="flex flex-row h-full overflow-hidden">
      <MarketList
        summaries={filteredSummaries}
        isReady={isStaticReady}
        isFetching={isFetching}
        cooldown={cooldown}
        search={search}
        selectedId={selectedSummary?.id ?? null}
        onSearchChange={setSearch}
        onSelect={handleSelect}
        onRefresh={refresh}
      />
      <DetailPanel
        summary={selectedSummary}
        prices={prices}
        onClose={handleClose}
      />
    </div>
  )
}
