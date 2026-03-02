import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Package2,
  X
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
}

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
      const sellPrices = rows.filter((r) => r.price_sell > 0).map((r) => r.price_sell)
      const sellAvgs = rows.filter((r) => r.price_sell_avg > 0).map((r) => r.price_sell_avg)
      const buyPrices = rows.filter((r) => r.price_buy > 0).map((r) => r.price_buy)
      const buyAvgs = rows.filter((r) => r.price_buy_avg > 0).map((r) => r.price_buy_avg)

      return {
        id: c.id,
        code: c.code,
        name: c.name,
        kind: c.kind || 'Other',
        bestSellPrice: sellPrices.length ? Math.max(...sellPrices) : 0,
        avgSellPrice: avg(sellAvgs),
        bestBuyPrice: buyPrices.length ? Math.min(...buyPrices) : 0,
        avgBuyPrice: avg(buyAvgs),
        terminalCount: rows.length
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

function groupByKind(summaries: CommoditySummary[]): [string, CommoditySummary[]][] {
  const map = new Map<string, CommoditySummary[]>()
  for (const s of summaries) {
    const list = map.get(s.kind) ?? []
    list.push(s)
    map.set(s.kind, list)
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
}

// ── Price value display ────────────────────────────────────────────────────

function PriceValue({
  current,
  avg,
  isBuy
}: {
  current: number
  avg: number
  isBuy?: boolean
}) {
  if (!current) {
    return <span className="font-mono text-xs text-hud-muted tabular-nums">—</span>
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

// ── Commodity row (left panel list) ───────────────────────────────────────

function CommodityRow({
  summary,
  isSelected,
  onClick
}: {
  summary: CommoditySummary
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full grid items-center px-4 py-1.5 border-l-2 transition-colors duration-100',
        'hover:bg-hud-deep/60 text-left',
        isSelected
          ? 'border-hud-cyan bg-hud-cyan/5'
          : 'border-transparent'
      )}
      style={{ gridTemplateColumns: '3rem 1fr 5.5rem 5.5rem' }}
    >
      <span className="font-mono text-xs text-hud-muted tracking-wide">{summary.code}</span>
      <span className="text-xs text-hud-text truncate pr-3">{summary.name}</span>
      <PriceValue current={summary.bestSellPrice} avg={summary.avgSellPrice} />
      <PriceValue current={summary.bestBuyPrice} avg={summary.avgBuyPrice} isBuy />
    </button>
  )
}

// ── Group header ───────────────────────────────────────────────────────────

function GroupHeader({ kind, count }: { kind: string; count: number }) {
  return (
    <div className="flex items-center gap-2 px-4 py-1.5 sticky top-0 bg-hud-deep z-10 border-b border-hud-border/40">
      <span className="hud-label text-hud-muted tracking-widest" style={{ fontSize: '10px' }}>
        {kind.toUpperCase()}
      </span>
      <span className="hud-label text-hud-dim" style={{ fontSize: '10px' }}>
        {count}
      </span>
    </div>
  )
}

// ── Left panel column headers ──────────────────────────────────────────────

function ListColumnHeaders() {
  const { t } = useTranslation()
  return (
    <div
      className="grid px-4 py-1.5 border-b border-hud-border shrink-0"
      style={{ gridTemplateColumns: '3rem 1fr 5.5rem 5.5rem' }}
    >
      <span className="hud-label text-hud-dim" style={{ fontSize: '9px' }} />
      <span className="hud-label text-hud-dim" style={{ fontSize: '9px' }}>{t('commodities.col.name')}</span>
      <span className="hud-label text-hud-dim text-right" style={{ fontSize: '9px' }}>{t('commodities.col.sell')}</span>
      <span className="hud-label text-hud-dim text-right" style={{ fontSize: '9px' }}>{t('commodities.col.buy')}</span>
    </div>
  )
}

// ── Left panel skeleton ────────────────────────────────────────────────────

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-0.5 px-4 pt-3">
      {Array.from({ length: 25 }).map((_, i) => (
        <Skeleton key={i} className="h-7 w-full" />
      ))}
    </div>
  )
}

// ── Left panel ────────────────────────────────────────────────────────────

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
  const groups = useMemo(() => groupByKind(summaries), [summaries])

  return (
    <div className="flex flex-col w-[55%] border-r border-hud-border shrink-0 min-h-0">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-hud-border shrink-0">
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
              {summaries.length}
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

      {/* Column headers */}
      {isReady && <ListColumnHeaders />}

      {/* Grouped list */}
      <div className="flex-1 overflow-auto scrollbar-hud">
        {!isReady ? (
          <ListSkeleton />
        ) : summaries.length === 0 ? (
          <p className="text-center text-hud-muted text-xs py-12">{t('commodities.noResults')}</p>
        ) : (
          groups.map(([kind, items]) => (
            <div key={kind}>
              <GroupHeader kind={kind} count={items.length} />
              {items.map((s) => (
                <CommodityRow
                  key={s.id}
                  summary={s}
                  isSelected={selectedId === s.id}
                  onClick={() => onSelect(s)}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── Terminal row (detail panel table) ─────────────────────────────────────

function TerminalRow({ row, tab }: { row: CommodityPrice; tab: 'buy' | 'sell' }) {
  const price = tab === 'buy' ? row.price_buy : row.price_sell
  const scu = tab === 'buy' ? row.scu_buy : row.scu_sell
  const priceColor = tab === 'sell' ? 'text-hud-green' : 'text-hud-amber'

  return (
    <tr className="border-b border-hud-border/40 hover:bg-hud-deep/50 transition-colors">
      <td className="px-3 py-2 font-mono text-xs text-hud-text">{row.terminal_name}</td>
      <td className="px-3 py-2 text-xs text-hud-muted">{row.star_system_name ?? '—'}</td>
      <td className="px-3 py-2 text-xs text-hud-muted">{row.planet_name ?? '—'}</td>
      <td className="px-3 py-2 font-mono text-xs text-hud-text text-right tabular-nums">
        {scu > 0 ? `${scu.toLocaleString('en-US')} SCU` : <span className="text-hud-muted">—</span>}
      </td>
      <td className={cn('px-3 py-2 font-mono text-xs text-right tabular-nums', price > 0 ? priceColor : 'text-hud-muted')}>
        {price > 0 ? `${price.toLocaleString('en-US')} aUEC` : '—'}
      </td>
      <td className="px-3 py-2 text-xs text-hud-muted text-right whitespace-nowrap">
        {row.date_modified ? formatRelativeTime(row.date_modified * 1000) : '—'}
      </td>
    </tr>
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

  const tableHeaders = useMemo(() => [
    { key: 'terminal', label: t('commodities.detail.col.terminal'), align: 'left' },
    { key: 'system',   label: t('commodities.detail.col.system'),   align: 'left' },
    { key: 'planet',   label: t('commodities.detail.col.planet'),   align: 'left' },
    { key: 'inventory',label: t('commodities.detail.col.inventory'),align: 'right' },
    { key: 'price',    label: `${t('commodities.detail.col.price')} (${tab === 'sell' ? t('commodities.detail.tab.sell') : t('commodities.detail.tab.buy')})`, align: 'right' },
    { key: 'updated',  label: t('commodities.detail.col.updated'),  align: 'right' }
  ], [t, tab])

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-hud-border shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-sm font-semibold text-hud-cyan shrink-0">
            {summary.code}
          </span>
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

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as 'sell' | 'buy')} className="flex flex-col flex-1 min-h-0">
        <div className="px-4 pt-2 shrink-0">
          <TabsList>
            <TabsTrigger value="sell">
              {t('commodities.detail.tab.sell')}{' '}
              <span className="ml-1.5 font-mono text-[10px]">({sellRows.length})</span>
            </TabsTrigger>
            <TabsTrigger value="buy">
              {t('commodities.detail.tab.buy')}{' '}
              <span className="ml-1.5 font-mono text-[10px]">({buyRows.length})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={tab} className="flex flex-col flex-1 min-h-0 pt-0">
          {displayRows.length === 0 ? (
            <p className="text-center text-hud-muted text-xs py-8">{t('commodities.detail.noTerminals')}</p>
          ) : (
            <div className="flex-1 overflow-auto scrollbar-hud">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-hud-panel">
                  <tr className="border-b border-hud-border">
                    {tableHeaders.map((h) => (
                      <th
                        key={h.key}
                        className={cn(
                          'px-3 py-2 hud-label text-hud-muted whitespace-nowrap',
                          h.align === 'right' ? 'text-right' : ''
                        )}
                        style={{ fontSize: '10px' }}
                      >
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((row) => (
                    <TerminalRow key={row.id} row={row} tab={tab} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  )
}

// ── Right panel ────────────────────────────────────────────────────────────

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
