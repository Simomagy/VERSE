import { useState, useMemo, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BACKDROP_VARIANTS, MODAL_VARIANTS, LIST_VARIANTS, ROW_VARIANTS } from '../lib/animations'
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  X,
  BarChart3,
  ArrowRight,
  History,
  CopyPlus,
  Pencil,
  RefreshCw
} from 'lucide-react'
import { useCommodityPrices } from '../hooks/useCommodityPrices'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Skeleton } from '../components/ui/skeleton'
import { ComboInput } from '../components/ui/combo-input'
import { useLocalFleet } from '../hooks/useFleet'
import { useLocalTrades, useAddTrade, useUpdateTrade, useRemoveTrade } from '../hooks/useTrades'
import { useStaticData } from '../hooks/useStaticData'
import { formatUEC, formatRelativeTime, abbrev } from '../lib/utils'
import { ContextMenu } from '../components/ui/context-menu'
import { useConfirmDialog, SelectAllCheckbox } from '../components/ui/confirm-dialog'
import type { LocalTrade, TradeItem, LocalRefineryJob } from '../api/types'

// ── Field wrapper ─────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="hud-label text-hud-muted mb-1.5 block">
        {label}
        {required && <span className="text-hud-red ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

// ── Item row state ────────────────────────────────────────────────────────

interface ItemRow {
  key: string
  commodity: string
  operation: 'buy' | 'sell'
  scu: string
  pricePerScu: string
  totalManual: boolean
  totalPrice: string
  autoPriced?: boolean // true = prezzo compilato da UEX, false = manuale
}

function emptyRow(): ItemRow {
  return {
    key: crypto.randomUUID(),
    commodity: '',
    operation: 'buy',
    scu: '',
    pricePerScu: '',
    totalManual: false,
    totalPrice: '',
    autoPriced: false
  }
}

function computeTotal(row: ItemRow): number {
  if (row.totalManual) return parseFloat(row.totalPrice) || 0
  const scu = parseFloat(row.scu) || 0
  const price = parseFloat(row.pricePerScu) || 0
  return Math.round(scu * price)
}

// ── Items table ───────────────────────────────────────────────────────────

function ItemsTable({
  rows,
  commoditySuggestions,
  onChange,
  onAdd,
  onRemove
}: {
  rows: ItemRow[]
  commoditySuggestions: string[]
  onChange: (key: string, updates: Partial<ItemRow>) => void
  onAdd: () => void
  onRemove: (key: string) => void
}) {
  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="grid grid-cols-[5rem_1fr_4.5rem_5.5rem_6rem_2rem] gap-2 px-1 pb-1">
        {['OP', 'COMMODITY', 'SCU', 'PRICE/SCU', 'TOTAL', ''].map((h) => (
          <span key={h} className="hud-label text-hud-dim text-right first:text-left">
            {h}
          </span>
        ))}
      </div>

      {rows.map((row) => {
        const autoTotal = computeTotal({ ...row, totalManual: false })
        return (
          <div
            key={row.key}
            className="grid grid-cols-[5rem_1fr_4.5rem_5.5rem_6rem_2rem] gap-2 items-start"
          >
            {/* Operation toggle */}
            <button
              type="button"
              onClick={() =>
                onChange(row.key, { operation: row.operation === 'buy' ? 'sell' : 'buy' })
              }
              className={[
                'h-9 flex items-center justify-center gap-1.5 border text-[10px] font-bold font-mono',
                'tracking-wider transition-all duration-150 cursor-pointer',
                row.operation === 'buy'
                  ? 'border-hud-green/50 bg-hud-green/10 text-hud-green hover:bg-hud-green/20'
                  : 'border-hud-cyan/50 bg-hud-cyan/10 text-hud-cyan hover:bg-hud-cyan/20'
              ].join(' ')}
            >
              {row.operation === 'buy' ? (
                <>
                  <TrendingDown className="h-3 w-3" />
                  BUY
                </>
              ) : (
                <>
                  <TrendingUp className="h-3 w-3" />
                  SELL
                </>
              )}
            </button>

            {/* Commodity */}
            <ComboInput
              value={row.commodity}
              onChange={(v) => onChange(row.key, { commodity: v })}
              suggestions={commoditySuggestions}
              placeholder="Commodity..."
            />

            {/* SCU */}
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={row.scu}
              onChange={(e) => onChange(row.key, { scu: e.target.value })}
            />

            {/* Price/SCU — indicatore ~ quando auto-compilato da UEX */}
            <div className="relative">
              {row.autoPriced && (
                <span
                  title="Auto-filled from UEX prices"
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] font-mono
                    text-hud-cyan/70 pointer-events-none select-none leading-none z-10"
                >
                  ~
                </span>
              )}
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={row.pricePerScu}
                className={row.autoPriced ? 'pl-4 border-hud-cyan/40' : ''}
                onChange={(e) => onChange(row.key, { pricePerScu: e.target.value })}
              />
            </div>

            {/* Total — auto o manuale */}
            <div className="relative">
              <Input
                type="number"
                min="0"
                placeholder={String(autoTotal || '0')}
                value={row.totalManual ? row.totalPrice : autoTotal > 0 ? String(autoTotal) : ''}
                disabled={!row.totalManual}
                className={!row.totalManual ? 'opacity-60 pr-6' : 'pr-6'}
                onChange={(e) => onChange(row.key, { totalPrice: e.target.value })}
              />
              <button
                type="button"
                title={row.totalManual ? 'Switch to auto' : 'Enter manually'}
                className={[
                  'absolute right-1 top-1/2 -translate-y-1/2',
                  'flex items-center justify-center w-4 h-4 text-[7px] font-bold font-mono border',
                  'transition-all duration-150 cursor-pointer select-none',
                  row.totalManual
                    ? 'bg-hud-amber/20 border-hud-amber text-hud-amber hover:bg-hud-amber/30'
                    : 'bg-hud-deep border-hud-border text-hud-muted hover:border-hud-amber hover:text-hud-amber'
                ].join(' ')}
                onClick={() =>
                  onChange(row.key, {
                    totalManual: !row.totalManual,
                    totalPrice: !row.totalManual ? String(autoTotal) : ''
                  })
                }
              >
                {row.totalManual ? 'M' : 'A'}
              </button>
            </div>

            {/* Remove */}
            <button
              type="button"
              disabled={rows.length === 1}
              onClick={() => onRemove(row.key)}
              className="h-9 flex items-center justify-center text-hud-muted hover:text-hud-red
                disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}

      <button
        type="button"
        onClick={onAdd}
        className="mt-1 flex items-center gap-1.5 hud-label text-hud-muted hover:text-hud-text
          transition-colors py-1"
      >
        <Plus className="h-3 w-3" />
        ADD COMMODITY
      </button>
    </div>
  )
}

// ── Pannello laterale unificato: refinery + live trade recap ─────────────

function ModalSidePanel({
  rows,
  refineryJobs
}: {
  rows: ItemRow[]
  refineryJobs?: LocalRefineryJob[]
}) {
  const fScu = (n: number | string) => {
    const v = typeof n === 'string' ? parseFloat(n) || 0 : n
    return v === 0 ? '0' : v % 1 === 0 ? String(v) : v.toFixed(2)
  }

  // Sezione raffineria
  const refTotals = useMemo(
    () =>
      refineryJobs?.length
        ? {
            estimated: refineryJobs.reduce((a, j) => a + j.totalEstimatedValue, 0),
            cost: refineryJobs.reduce((a, j) => a + j.refineCost, 0),
            net: refineryJobs.reduce((a, j) => a + j.netProfit, 0)
          }
        : null,
    [refineryJobs]
  )

  // Sezione trade live
  const filledRows = rows.filter((r) => r.commodity.trim())
  const buyRows = filledRows.filter((r) => r.operation === 'buy')
  const sellRows = filledRows.filter((r) => r.operation === 'sell')
  const tradeTotals = useMemo(() => {
    const buy = buyRows.reduce((a, r) => a + computeTotal(r), 0)
    const sell = sellRows.reduce((a, r) => a + computeTotal(r), 0)
    return { buy, sell, net: sell - buy }
  }, [buyRows, sellRows])

  const ItemLine = ({ r, color }: { r: ItemRow; color: string }) => {
    const total = computeTotal(r)
    return (
      <div className="grid grid-cols-[1fr_auto] gap-x-2 items-start pl-1 mb-0.5">
        <div className="min-w-0">
          <span className="font-mono text-xs text-hud-text block truncate" title={r.commodity}>
            {abbrev(r.commodity)}
          </span>
          <span className="hud-label text-hud-dim">
            {r.scu ? `${fScu(parseFloat(r.scu) || 0)} SCU` : '—'}
            {r.pricePerScu
              ? ` · ${r.autoPriced ? '~' : ''}${formatUEC(parseFloat(r.pricePerScu))}/SCU`
              : ''}
          </span>
        </div>
        <span className={`font-mono text-xs whitespace-nowrap ${color}`}>
          {total > 0 ? formatUEC(total) : '—'}
        </span>
      </div>
    )
  }

  return (
    <div className="w-[16rem] shrink-0 border-l border-hud-border flex flex-col bg-hud-deep/40">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-hud-border shrink-0">
        <span className="w-1.5 h-1.5 bg-hud-amber shrink-0" />
        <span className="hud-label text-hud-amber tracking-widest">SUMMARY</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hud">
        {/* ── Refinery jobs (se presenti) ── */}
        {refineryJobs?.length ? (
          <div className="p-3 border-b border-hud-border/50 space-y-3">
            <div className="flex items-center gap-1.5">
              <span className="hud-label text-hud-purple">⬡ REFINERY</span>
              <span className="hud-label text-hud-dim ml-auto">
                {refineryJobs.length} JOB{refineryJobs.length > 1 ? 'S' : ''}
              </span>
            </div>

            {refineryJobs.map((job, idx) => (
              <div key={job.id}>
                <div className="hud-label text-hud-dim mb-1">
                  #{idx + 1} {abbrev(job.refinery, 16)} · {job.methodCode}
                </div>
                {job.minerals
                  .filter((m) => m.scuOutput > 0)
                  .map((m, mi) => (
                    <div
                      key={mi}
                      className="grid grid-cols-[1fr_auto_auto] gap-x-2 items-baseline pl-1"
                    >
                      <span className="font-mono text-xs text-hud-text truncate" title={m.mineral}>
                        {abbrev(m.mineral)}
                      </span>
                      <span className="font-mono text-xs text-hud-muted whitespace-nowrap">
                        {fScu(m.scuOutput)} SCU
                      </span>
                      <span className="font-mono text-xs text-hud-cyan whitespace-nowrap">
                        {formatUEC(m.estimatedValue)}
                      </span>
                    </div>
                  ))}
                <div className="flex justify-between mt-1 pt-1 border-t border-hud-border/20 pl-1">
                  <span className="hud-label text-hud-dim">net</span>
                  <span
                    className={`font-mono text-xs font-bold ${job.netProfit >= 0 ? 'text-hud-cyan' : 'text-hud-red'}`}
                  >
                    {job.netProfit >= 0 ? '+' : ''}
                    {formatUEC(job.netProfit)}
                  </span>
                </div>
              </div>
            ))}

            {refTotals && refineryJobs.length > 1 && (
              <div className="pt-2 border-t border-hud-border/40 space-y-0.5">
                <div className="flex justify-between">
                  <span className="hud-label text-hud-muted">estimated</span>
                  <span className="font-mono text-xs text-hud-text">
                    {formatUEC(refTotals.estimated)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="hud-label text-hud-muted">cost</span>
                  <span className="font-mono text-xs text-hud-amber">
                    {formatUEC(refTotals.cost)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* ── Trade recap live ── */}
        <div className="p-3 space-y-2.5">
          <span className="hud-label text-hud-amber">TRADE RECAP</span>

          {filledRows.length === 0 ? (
            <p className="hud-label text-hud-dim py-3 text-center leading-relaxed">
              Fill in commodities
              <br />
              to see the recap
            </p>
          ) : (
            <>
              {buyRows.length > 0 && (
                <div>
                  <div className="hud-label text-hud-green mb-1">↓ BUY</div>
                  {buyRows.map((r) => (
                    <ItemLine key={r.key} r={r} color="text-hud-green" />
                  ))}
                </div>
              )}
              {sellRows.length > 0 && (
                <div>
                  <div className="hud-label text-hud-cyan mb-1">↑ SELL</div>
                  {sellRows.map((r) => (
                    <ItemLine key={r.key} r={r} color="text-hud-cyan" />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Totali trade footer */}
      <div className="shrink-0 p-3 border-t border-hud-border space-y-1">
        <div className="flex justify-between">
          <span className="hud-label text-hud-muted">BUY</span>
          <span className="font-mono text-xs text-hud-green">
            {tradeTotals.buy > 0 ? formatUEC(tradeTotals.buy) : '—'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="hud-label text-hud-muted">SELL</span>
          <span className="font-mono text-xs text-hud-cyan">
            {tradeTotals.sell > 0 ? formatUEC(tradeTotals.sell) : '—'}
          </span>
        </div>
        <div className="flex justify-between pt-1 border-t border-hud-border/40">
          <span className="hud-label text-hud-muted font-bold">NET</span>
          <span
            className={`font-mono text-xs font-bold ${
              tradeTotals.net > 0
                ? 'text-hud-cyan'
                : tradeTotals.net < 0
                  ? 'text-hud-red'
                  : 'text-hud-dim'
            }`}
          >
            {tradeTotals.net !== 0
              ? (tradeTotals.net > 0 ? '+' : '') + formatUEC(tradeTotals.net)
              : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Modal aggiunta trade ──────────────────────────────────────────────────

interface TradeHeader {
  shipId: string
  locationFrom: string
  locationTo: string
  notes: string
}

const EMPTY_HEADER: TradeHeader = { shipId: '', locationFrom: '', locationTo: '', notes: '' }

interface AddTradeModalProps {
  onClose: () => void
  editTrade?: LocalTrade | null // se presente → modalità edit (update); null/undefined → nuovo
  initialHeader?: Partial<TradeHeader>
  initialRows?: ItemRow[]
  source?: string // e.g. 'refinery'
  refineryJobs?: LocalRefineryJob[]
}

function AddTradeModal({
  onClose,
  editTrade,
  initialHeader,
  initialRows,
  source,
  refineryJobs
}: AddTradeModalProps) {
  const { data: fleet = [] } = useLocalFleet()
  const addTrade = useAddTrade()
  const updateTrade = useUpdateTrade()
  const { commodities, getTradeLocations } = useStaticData()
  const {
    getPriceAt,
    terminalNames,
    isFetching: pricesFetching,
    cooldown,
    refresh: refreshPrices,
    dataUpdatedAt
  } = useCommodityPrices()

  const [header, setHeader] = useState<TradeHeader>({ ...EMPTY_HEADER, ...initialHeader })
  const [rows, setRows] = useState<ItemRow[]>(initialRows ?? [emptyRow()])

  const commoditySuggestions = useMemo(() => commodities.map((c) => c.name), [commodities])
  // Se i prezzi UEX sono caricati, usiamo i terminal_name reali come suggestions
  // (corrispondono esattamente alle chiavi usate dal lookup getPriceAt)
  const locationSuggestions = useMemo(
    () => (terminalNames.length > 0 ? terminalNames : getTradeLocations()),

    [terminalNames, getTradeLocations]
  )

  // Auto-fill pricePerScu per righe con commodity valida e prezzo vuoto/auto.
  // Viene rieseguito quando cambiano le locations header, o arrivano nuovi dati prezzi.
  useEffect(() => {
    console.log(
      '[AutoPrice:useEffect] locationFrom:',
      header.locationFrom,
      'locationTo:',
      header.locationTo,
      'dataUpdatedAt:',
      dataUpdatedAt
    )
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows((prev) => {
      let changed = false
      const next = prev.map((r) => {
        if (r.pricePerScu && !r.autoPriced) return r // prezzo manuale, non toccare
        const loc = r.operation === 'buy' ? header.locationFrom : header.locationTo
        if (!r.commodity.trim() || !loc.trim()) return r
        const price = getPriceAt(r.commodity, loc, r.operation)
        if (!price) {
          if (r.autoPriced && r.pricePerScu) {
            changed = true
            return { ...r, pricePerScu: '', autoPriced: false }
          }
          return r
        }
        if (r.autoPriced && String(price) === r.pricePerScu) return r
        changed = true
        return { ...r, pricePerScu: String(price), autoPriced: true }
      })
      return changed ? next : prev
    })
  }, [header.locationFrom, header.locationTo, getPriceAt, dataUpdatedAt])

  const updateRow = useCallback(
    (key: string, updates: Partial<ItemRow>) => {
      setRows((prev) =>
        prev.map((r) => {
          if (r.key !== key) return r
          const updated = { ...r, ...updates }

          // L'utente ha digitato manualmente un prezzo: rimuovi flag auto e stop
          if ('pricePerScu' in updates) {
            updated.autoPriced = false
            return updated
          }

          const loc = updated.operation === 'buy' ? header.locationFrom : header.locationTo

          // Commodity o operation cambiati: il vecchio prezzo è stale → aggiorna sempre
          if ('commodity' in updates || 'operation' in updates) {
            const price = getPriceAt(updated.commodity, loc, updated.operation)
            console.log(
              '[AutoPrice:updateRow] Commodity:',
              updated.commodity,
              'Location:',
              loc,
              'Operation:',
              updated.operation,
              'Price:',
              price
            )
            if (price) {
              console.log('[AutoPrice:updateRow] Setting price:', price)
              updated.pricePerScu = String(price)
              updated.autoPriced = true
            } else if (updated.autoPriced) {
              console.log(
                '[AutoPrice:updateRow] Clearing price because UEX has no price for the new combo'
              )
              // Era auto-priced ma UEX non ha il prezzo per la nuova combo → pulisci
              updated.pricePerScu = ''
              updated.autoPriced = false
            }
          }

          // SCU cambiato: tenta auto-fill solo se il prezzo è ancora vuoto
          if ('scu' in updates && !updated.pricePerScu && updated.commodity.trim() && loc.trim()) {
            const price = getPriceAt(updated.commodity, loc, updated.operation)
            if (price) {
              updated.pricePerScu = String(price)
              updated.autoPriced = true
            }
          }

          return updated
        })
      )
    },
    [header.locationFrom, header.locationTo, getPriceAt]
  )

  const addRow = () => setRows((prev) => [...prev, emptyRow()])
  const removeRow = (key: string) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev))

  const setHeaderField = (field: keyof TradeHeader, value: string) =>
    setHeader((prev) => ({ ...prev, [field]: value }))

  const totals = useMemo(() => {
    let buy = 0
    let sell = 0
    for (const r of rows) {
      const t = computeTotal(r)
      if (r.operation === 'buy') buy += t
      else sell += t
    }
    return { buy, sell, profit: sell - buy }
  }, [rows])

  const hasSellItems = rows.some((r) => r.operation === 'sell')
  const isValid =
    header.locationFrom.trim() &&
    (!hasSellItems || header.locationTo.trim()) &&
    rows.some((r) => r.commodity.trim() && (parseFloat(r.scu) || 0) > 0 && computeTotal(r) > 0)

  const isPending = addTrade.isPending || updateTrade.isPending

  const handleSubmit = async () => {
    const selectedShip = fleet.find((s) => s.id === header.shipId)
    const items: TradeItem[] = rows
      .filter((r) => r.commodity.trim() && (parseFloat(r.scu) || 0) > 0)
      .map((r) => ({
        commodity: r.commodity.trim(),
        operation: r.operation,
        scu: parseFloat(r.scu) || 0,
        pricePerScu: parseFloat(r.pricePerScu) || 0,
        totalPrice: computeTotal(r)
      }))

    const payload = {
      shipId: header.shipId || null,
      shipName: selectedShip?.nickname ?? selectedShip?.wikiName ?? '',
      locationFrom: header.locationFrom.trim(),
      locationTo: header.locationTo.trim(),
      items,
      totalBuy: totals.buy,
      totalSell: totals.sell,
      netProfit: totals.profit,
      notes: header.notes.trim(),
      ...(source ? { source } : {})
    }

    if (editTrade) {
      await updateTrade.mutateAsync({ ...editTrade, ...payload })
    } else {
      await addTrade.mutateAsync(payload)
    }
    onClose()
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      variants={BACKDROP_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        className="w-full max-w-[56rem] bg-hud-panel border border-hud-border
          shadow-[0_0_40px_rgba(232,160,32,0.08)] flex flex-col max-h-[88vh]"
        variants={MODAL_VARIANTS}
      >
        {/* Header modal */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-hud-border shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-hud-amber" />
            <span className="hud-label text-hud-text tracking-widest">
              {editTrade ? 'EDIT TRADE RUN' : 'LOG TRADE RUN'}
            </span>
            {/* Refresh prezzi UEX */}
            <button
              type="button"
              onClick={refreshPrices}
              disabled={cooldown > 0 || pricesFetching}
              title={cooldown > 0 ? `Refresh available in ${cooldown}s` : 'Refresh UEX prices'}
              className={[
                'flex items-center gap-1 px-1.5 py-0.5 border text-[9px] font-mono font-bold',
                'tracking-wider transition-all duration-150',
                cooldown > 0 || pricesFetching
                  ? 'border-hud-border text-hud-dim cursor-not-allowed opacity-50'
                  : 'border-hud-cyan/40 text-hud-cyan/70 hover:border-hud-cyan hover:text-hud-cyan cursor-pointer'
              ].join(' ')}
            >
              <RefreshCw
                className={['h-2.5 w-2.5', pricesFetching ? 'animate-spin' : ''].join(' ')}
              />
              {cooldown > 0 ? `${cooldown}s` : 'PRICES'}
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-hud-muted hover:text-hud-red transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body: form a sinistra, riepilogo raffineria a destra */}
        <div className="flex flex-1 min-h-0">
          <div className="flex-1 min-w-0 overflow-y-auto scrollbar-hud p-5 space-y-5">
            {/* ── Header route ── */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="FROM" required>
                <ComboInput
                  value={header.locationFrom}
                  onChange={(v) => setHeaderField('locationFrom', v)}
                  suggestions={locationSuggestions}
                  placeholder="e.g. Lorville"
                />
              </Field>
              <Field label="TO" required={hasSellItems}>
                <ComboInput
                  value={header.locationTo}
                  onChange={(v) => setHeaderField('locationTo', v)}
                  suggestions={locationSuggestions}
                  placeholder="e.g. Area18"
                />
              </Field>
            </div>

            <Field label="VESSEL">
              <select
                className="w-full h-9 border border-hud-border bg-hud-deep px-3 text-sm text-hud-text font-mono
                focus:outline-none focus:border-hud-amber focus:shadow-[0_0_0_1px_rgba(232,160,32,0.2)]
                transition-[border-color,box-shadow] duration-150"
                value={header.shipId}
                onChange={(e) => setHeaderField('shipId', e.target.value)}
              >
                <option value="">— None / Unspecified —</option>
                {fleet.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nickname || s.wikiName}
                  </option>
                ))}
              </select>
            </Field>

            {/* ── Commodities table ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="hud-label text-hud-muted">COMMODITIES</span>
                <div className="flex-1 h-px bg-hud-border" />
                <span className="hud-label text-hud-dim">Click OP to toggle BUY/SELL</span>
              </div>
              <ItemsTable
                rows={rows}
                commoditySuggestions={commoditySuggestions}
                onChange={updateRow}
                onAdd={addRow}
                onRemove={removeRow}
              />
            </div>

            {/* ── Totali ── */}
            {(totals.buy > 0 || totals.sell > 0) && (
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-hud-border">
                <div className="hud-panel p-2 text-center">
                  <p className="hud-label text-hud-dim">TOTAL BUY</p>
                  <p className="font-mono text-sm text-hud-green">{formatUEC(totals.buy)}</p>
                </div>
                <div className="hud-panel p-2 text-center">
                  <p className="hud-label text-hud-dim">TOTAL SELL</p>
                  <p className="font-mono text-sm text-hud-cyan">{formatUEC(totals.sell)}</p>
                </div>
                <div className="hud-panel p-2 text-center">
                  <p className="hud-label text-hud-dim">NET PROFIT</p>
                  <p
                    className={`font-mono text-sm font-bold ${totals.profit >= 0 ? 'text-hud-cyan' : 'text-hud-red'}`}
                  >
                    {totals.profit >= 0 ? '+' : ''}
                    {formatUEC(totals.profit)}
                  </p>
                </div>
              </div>
            )}

            <Field label="NOTES">
              <Input
                placeholder="Optional..."
                value={header.notes}
                onChange={(e) => setHeaderField('notes', e.target.value)}
              />
            </Field>
          </div>

          {/* Pannello laterale: presente su tutti i modali */}
          <ModalSidePanel rows={rows} refineryJobs={refineryJobs} />
        </div>
        {/* end body flex */}

        {/* Footer modal */}
        <div className="flex gap-2 px-5 py-3 border-t border-hud-border shrink-0">
          <Button variant="hud-ghost" className="flex-1" onClick={onClose}>
            CANCEL
          </Button>
          <Button
            variant="hud"
            className="flex-1 border-hud-amber/60 text-hud-amber hover:bg-hud-amber/10"
            onClick={handleSubmit}
            disabled={!isValid || isPending}
          >
            {isPending ? 'SAVING...' : editTrade ? 'UPDATE RUN' : 'LOG TRADE RUN'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Riga trade nella lista ────────────────────────────────────────────────

function TradeRow({
  trade,
  selected,
  onSelect,
  onEdit,
  onRemove,
  onCreateSell
}: {
  trade: LocalTrade
  selected: boolean
  onSelect: () => void
  onEdit: () => void
  onRemove: () => void
  onCreateSell: () => void
}) {
  const buyItems = trade.items.filter((i) => i.operation === 'buy')
  const sellItems = trade.items.filter((i) => i.operation === 'sell')
  const hasProfit = trade.netProfit >= 0
  const hasBuyOnly = buyItems.length > 0 && sellItems.length === 0

  const menuItems = [
    { label: 'Edit Trade Run', icon: <Pencil className="h-3 w-3" />, onClick: onEdit },
    ...(hasBuyOnly
      ? [
          {
            label: 'Create Sell Run',
            icon: <CopyPlus className="h-3 w-3" />,
            onClick: onCreateSell
          }
        ]
      : []),
    { separator: true as const },
    {
      label: 'Remove',
      icon: <Trash2 className="h-3 w-3" />,
      variant: 'danger' as const,
      onClick: onRemove
    }
  ]

  return (
    <ContextMenu items={menuItems}>
      <div
        className={`hud-row group px-4 py-2.5 border-b border-hud-border/40 last:border-b-0
      transition-colors duration-150 ${selected ? 'bg-hud-red/5 border-l-2 border-l-hud-red/50' : ''}`}
      >
        <div className="grid grid-cols-[1.25rem_minmax(0,1fr)_6rem_6rem_7rem_auto] gap-x-3 gap-y-0 items-center">
          {/* Checkbox */}
          <button
            onClick={onSelect}
            title={selected ? 'Deselect' : 'Select'}
            className={`w-4 h-4 border shrink-0 flex items-center justify-center transition-all duration-150
            ${
              selected
                ? 'border-hud-red bg-hud-red/20 text-hud-red'
                : 'border-hud-border text-transparent hover:border-hud-red/60 hover:bg-hud-red/5'
            }`}
          >
            <span className="text-[10px] font-bold leading-none">✓</span>
          </button>

          {/* Route + items */}
          <div className="min-w-0 flex flex-col gap-1">
            {/* Route line */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className="font-mono text-sm font-semibold text-hud-text"
                title={trade.locationFrom}
              >
                {trade.locationFrom}
              </span>
              {trade.locationTo && (
                <>
                  <ArrowRight className="h-3 w-3 text-hud-dim shrink-0" />
                  <span className="font-mono text-sm text-hud-text" title={trade.locationTo}>
                    {trade.locationTo}
                  </span>
                </>
              )}
              {trade.shipName && (
                <span className="hud-label text-hud-dim">· {abbrev(trade.shipName, 18)}</span>
              )}
              {trade.source === 'refinery' && (
                <span
                  className="hud-label px-1.5 py-0.5 border border-hud-amber/40
                bg-hud-amber/10 text-hud-amber tracking-widest"
                >
                  ⬡ REF
                </span>
              )}
            </div>
            {/* Item tags */}
            <div className="flex flex-wrap gap-1">
              {buyItems.map((item, i) => (
                <span
                  key={`b${i}`}
                  title={item.commodity}
                  className="hud-label text-hud-green bg-hud-green/10 border border-hud-green/20 px-1.5 py-0.5"
                >
                  ↓ {abbrev(item.commodity)} {item.scu} SCU
                </span>
              ))}
              {sellItems.map((item, i) => (
                <span
                  key={`s${i}`}
                  title={item.commodity}
                  className="hud-label text-hud-cyan bg-hud-cyan/10 border border-hud-cyan/20 px-1.5 py-0.5"
                >
                  ↑ {abbrev(item.commodity)} {item.scu} SCU
                </span>
              ))}
            </div>
          </div>

          {/* Total buy */}
          <div className="text-right shrink-0">
            {trade.totalBuy > 0 ? (
              <>
                <p className="font-mono text-xs text-hud-green">{formatUEC(trade.totalBuy)}</p>
                <p className="hud-label text-hud-dim">BUY</p>
              </>
            ) : (
              <span className="hud-label text-hud-dim">—</span>
            )}
          </div>

          {/* Total sell */}
          <div className="text-right shrink-0">
            {trade.totalSell > 0 ? (
              <>
                <p className="font-mono text-xs text-hud-cyan">{formatUEC(trade.totalSell)}</p>
                <p className="hud-label text-hud-dim">SELL</p>
              </>
            ) : (
              <span className="hud-label text-hud-dim">—</span>
            )}
          </div>

          {/* Net profit + date */}
          <div className="text-right shrink-0">
            <p
              className={`font-mono text-sm font-bold ${hasProfit ? 'text-hud-cyan' : 'text-hud-red'}`}
            >
              {trade.netProfit !== 0 ? (hasProfit ? '+' : '') + formatUEC(trade.netProfit) : '—'}
            </p>
            <p className="hud-label text-hud-dim">{formatRelativeTime(trade.dateAdded)}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-1">
            {hasBuyOnly && (
              <button
                onClick={onCreateSell}
                title="Create matching sell run"
                className="flex items-center gap-1 px-2 py-1 border border-hud-green/30 text-hud-green/50
                hover:border-hud-green hover:text-hud-green hover:bg-hud-green/5
                transition-all duration-150 hud-label"
              >
                <CopyPlus className="h-3 w-3" />
                SELL
              </button>
            )}
            <button
              onClick={onEdit}
              title="Edit trade run"
              className="flex items-center justify-center w-7 h-7 border border-hud-border
              text-hud-dim hover:border-hud-cyan/60 hover:text-hud-cyan hover:bg-hud-cyan/5
              transition-all duration-150"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={onRemove}
              title="Remove"
              className="flex items-center justify-center w-7 h-7 border border-hud-border
              text-hud-dim hover:border-hud-red/60 hover:text-hud-red hover:bg-hud-red/5
              transition-all duration-150"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </ContextMenu>
  )
}

// ── Stats panel ───────────────────────────────────────────────────────────

function TradeStats({ trades }: { trades: LocalTrade[] }) {
  const stats = useMemo(() => {
    const revenue = trades.reduce((a, t) => a + t.totalSell, 0)
    const cost = trades.reduce((a, t) => a + t.totalBuy, 0)
    const scu = trades.reduce((a, t) => a + t.items.reduce((b, i) => b + i.scu, 0), 0)
    return { revenue, cost, profit: revenue - cost, scu }
  }, [trades])

  const items = [
    { label: 'REVENUE', value: formatUEC(stats.revenue), unit: 'aUEC', color: 'text-hud-cyan' },
    { label: 'COSTS', value: formatUEC(stats.cost), unit: 'aUEC', color: 'text-hud-green' },
    {
      label: 'NET PROFIT',
      value: formatUEC(stats.profit),
      unit: 'aUEC',
      color: stats.profit >= 0 ? 'text-hud-cyan' : 'text-hud-red'
    },
    { label: 'VOLUME', value: stats.scu.toLocaleString(), unit: 'SCU', color: 'text-hud-text' }
  ]

  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((s) => (
        <div key={s.label} className="hud-panel p-3">
          <p className="hud-label text-hud-muted">{s.label}</p>
          <p className={`font-mono text-lg font-bold mt-1 ${s.color}`}>{s.value}</p>
          <p className="hud-label text-hud-dim">{s.unit}</p>
        </div>
      ))}
    </div>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────

interface SellModalState {
  editTrade?: LocalTrade // undefined = nuovo trade
  initialHeader: Partial<TradeHeader>
  initialRows: ItemRow[]
  source?: string // e.g. 'refinery'
  refineryJobs?: LocalRefineryJob[] // jobs di origine per il riepilogo laterale
}

export function TradesView() {
  const { data: trades = [], isLoading } = useLocalTrades()
  const removeTrade = useRemoveTrade()
  const location = useLocation()
  const { confirm, dialog } = useConfirmDialog()
  const [showModal, setShowModal] = useState(false)
  const [sellModal, setSellModal] = useState<SellModalState | null>(null)
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll(selectAll: boolean) {
    setSelectedIds(selectAll ? new Set(filtered.map((t) => t.id)) : new Set())
  }

  function handleBulkDelete() {
    confirm(
      {
        title: 'Delete Trades',
        message: `Delete ${selectedIds.size} trade run${selectedIds.size > 1 ? 's' : ''}? This cannot be undone.`
      },
      () => {
        selectedIds.forEach((id) => removeTrade.mutate(id))
        setSelectedIds(new Set())
      }
    )
  }

  function askRemoveTrade(trade: LocalTrade) {
    confirm(
      {
        title: 'Remove Trade',
        message: `Remove trade run "${trade.locationFrom}${trade.locationTo ? ` → ${trade.locationTo}` : ''}"?`
      },
      () => removeTrade.mutate(trade.id)
    )
  }

  const anySelected = selectedIds.size > 0

  function tradeToModalState(trade: LocalTrade): { header: Partial<TradeHeader>; rows: ItemRow[] } {
    return {
      header: {
        shipId: trade.shipId ?? '',
        locationFrom: trade.locationFrom,
        locationTo: trade.locationTo,
        notes: trade.notes
      },
      rows: trade.items.map((i) => ({
        key: crypto.randomUUID(),
        commodity: i.commodity,
        operation: i.operation,
        scu: String(i.scu),
        pricePerScu: String(i.pricePerScu),
        totalManual: false,
        totalPrice: '',
        autoPriced: false // prezzo salvato = manuale, non sovrascrivere con UEX
      }))
    }
  }

  // Navigazione da raffinerie: pre-compila locationFrom e righe di vendita con SCU output.
  useEffect(() => {
    const state = location.state as {
      fromRefinery?: boolean
      refineryLocation?: string
      refineryJobs?: LocalRefineryJob[]
    } | null
    if (state?.fromRefinery) {
      // Una riga di vendita per ogni minerale con scuOutput > 0, prezzo vuoto per UEX auto-fill
      const prefillRows: ItemRow[] = (state.refineryJobs ?? []).flatMap((job) =>
        job.minerals
          .filter((m) => m.scuOutput > 0)
          .map((m) => ({
            key: crypto.randomUUID(),
            commodity: m.mineral,
            operation: 'sell' as const,
            scu: String(m.scuOutput), // SCU OUTPUT (post-raffinazione)
            pricePerScu: '',
            totalManual: false,
            totalPrice: '',
            autoPriced: false
          }))
      )
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSellModal({
        editTrade: undefined,
        initialHeader: { locationFrom: state.refineryLocation ?? '' },
        initialRows: prefillRows.length > 0 ? prefillRows : [emptyRow()],
        source: 'refinery',
        refineryJobs: state.refineryJobs
      })
      window.history.replaceState({}, '')
    }
  }, [location.state])

  const handleCreateSell = (trade: LocalTrade) => {
    // Righe buy esistenti: mantenute con prezzi originali (non sovrascrivere con UEX)
    const buyRows: ItemRow[] = trade.items
      .filter((i) => i.operation === 'buy')
      .map((i) => ({
        key: crypto.randomUUID(),
        commodity: i.commodity,
        operation: 'buy' as const,
        scu: String(i.scu),
        pricePerScu: String(i.pricePerScu),
        totalManual: false,
        totalPrice: '',
        autoPriced: false
      }))

    // Righe sell nuove: stesse commodity/SCU, prezzi vuoti — verranno auto-compilati da UEX
    const sellRows: ItemRow[] = trade.items
      .filter((i) => i.operation === 'buy')
      .map((i) => ({
        key: crypto.randomUUID(),
        commodity: i.commodity,
        operation: 'sell' as const,
        scu: String(i.scu),
        pricePerScu: '',
        totalManual: false,
        totalPrice: '',
        autoPriced: false
      }))

    setSellModal({
      editTrade: trade,
      initialHeader: {
        shipId: trade.shipId ?? '',
        locationFrom: trade.locationFrom,
        locationTo: trade.locationTo,
        notes: trade.notes
      },
      initialRows: [...buyRows, ...(sellRows.length > 0 ? sellRows : [emptyRow()])]
    })
  }

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const filtered = useMemo(() => {
    if (filter === 'all') return trades
    return trades.filter((t) => t.items.some((i) => i.operation === filter))
  }, [trades, filter])

  const FILTERS: { id: 'all' | 'buy' | 'sell'; label: string }[] = [
    { id: 'all', label: 'ALL' },
    { id: 'buy', label: 'BUY' },
    { id: 'sell', label: 'SELL' }
  ]

  return (
    <div className="relative flex flex-col h-full w-full p-5 gap-4">
      {/* Header sezione */}
      <div className="flex items-center justify-between hud-section-trades px-3 py-3 border border-hud-amber/20">
        <div className="flex items-center gap-3">
          <History className="h-5 w-5 text-hud-amber drop-shadow-[0_0_4px_rgba(232,160,32,0.8)]" />
          <div>
            <h1
              className="font-mono text-sm font-bold tracking-[0.15em] text-hud-amber uppercase"
              style={{ textShadow: '0 0 8px rgba(232,160,32,0.4)' }}
            >
              Trade Log
            </h1>
            <p className="hud-label mt-0.5 text-hud-muted">{trades.length} RUNS LOGGED</p>
          </div>
        </div>
        <Button variant="hud-amber" size="sm" onClick={() => setShowModal(true)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          LOG TRADE RUN
        </Button>
      </div>

      {trades.length > 0 && <TradeStats trades={trades} />}

      {/* Filtri */}
      <div className="flex items-center gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={`px-3 py-1 hud-label transition-colors duration-100 ${
              filter === f.id
                ? 'text-hud-amber border-b border-hud-amber'
                : 'text-hud-muted hover:text-hud-text'
            }`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
        <div className="flex-1 h-px bg-hud-border ml-2" />
        {anySelected && <span className="hud-label text-hud-red">{selectedIds.size} SELECTED</span>}
      </div>

      {/* Intestazione colonne */}
      <div className="grid grid-cols-[1.25rem_minmax(0,1fr)_6rem_6rem_7rem_auto] gap-x-3 px-4 pb-1">
        <SelectAllCheckbox
          total={filtered.length}
          selected={selectedIds.size}
          onToggle={toggleSelectAll}
          accentColor="hud-amber"
        />
        <span className="hud-label">ROUTE / COMMODITIES</span>
        <span className="hud-label text-right">BUY</span>
        <span className="hud-label text-right">SELL</span>
        <span className="hud-label text-right">PROFIT</span>
        <span />
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3">
          <div className="border border-hud-amber/20 bg-hud-amber/5 p-8">
            <BarChart3
              className="h-12 w-12 text-hud-amber/40 mx-auto mb-3
              drop-shadow-[0_0_8px_rgba(232,160,32,0.3)]"
            />
            <p className="hud-label text-hud-amber text-center">
              {trades.length === 0 ? 'NO TRADES LOGGED' : 'NO TRADES WITH THIS FILTER'}
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          className="overflow-y-auto scrollbar-hud flex-1 min-h-0 pb-14"
          variants={LIST_VARIANTS}
          initial="initial"
          animate="animate"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((trade) => (
              <motion.div key={trade.id} variants={ROW_VARIANTS} layout="position">
                <TradeRow
                  trade={trade}
                  selected={selectedIds.has(trade.id)}
                  onSelect={() => toggleSelect(trade.id)}
                  onEdit={() => {
                    const s = tradeToModalState(trade)
                    setSellModal({ editTrade: trade, initialHeader: s.header, initialRows: s.rows })
                  }}
                  onRemove={() => askRemoveTrade(trade)}
                  onCreateSell={() => handleCreateSell(trade)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Floating bulk delete */}
      {anySelected && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-5 py-2.5
              bg-hud-deep border border-hud-red/60 text-hud-red
              font-mono text-xs tracking-widest uppercase
              hover:bg-hud-red/10 hover:border-hud-red hover:shadow-[0_0_20px_rgba(255,60,60,0.25)]
              active:bg-hud-red/20 transition-all duration-150
              shadow-[0_4px_24px_rgba(0,0,0,0.7)]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            DELETE {selectedIds.size} RUN{selectedIds.size > 1 ? 'S' : ''}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedIds(new Set())
              }}
              className="ml-1 text-hud-red/40 hover:text-hud-red transition-colors"
              title="Clear selection"
            >
              <X className="h-3 w-3" />
            </button>
          </button>
        </div>
      )}

      {dialog}
      <AnimatePresence>
        {showModal && <AddTradeModal key="add-modal" onClose={() => setShowModal(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {sellModal && (
          <AddTradeModal
            key="sell-modal"
            onClose={() => setSellModal(null)}
            editTrade={sellModal.editTrade}
            initialHeader={sellModal.initialHeader}
            initialRows={sellModal.initialRows}
            source={sellModal.source}
            refineryJobs={sellModal.refineryJobs}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
