import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BACKDROP_VARIANTS, MODAL_VARIANTS, LIST_VARIANTS, ROW_VARIANTS } from '../lib/animations'
import { FlaskConical, Plus, Trash2, X, TrendingUp, Clock, ShoppingCart } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Skeleton } from '../components/ui/skeleton'
import { ComboInput } from '../components/ui/combo-input'
import { useRefineryMethods, useRefineryYields } from '../hooks/useRefinery'
import {
  useLocalRefineryJobs,
  useAddRefineryJob,
  useUpdateRefineryJob,
  useRemoveRefineryJob
} from '../hooks/useRefineryJobs'
import { useStaticData } from '../hooks/useStaticData'
import { formatUEC, formatRelativeTime, abbrev } from '../lib/utils'
import { ContextMenu } from '../components/ui/context-menu'
import { useConfirmDialog, SelectAllCheckbox } from '../components/ui/confirm-dialog'
import type { LocalRefineryJob, RefineryMethod, RefineryMineral } from '../api/types'

// ── Rating helpers ────────────────────────────────────────────────────────

const RATING_COLOR: Record<number, string> = {
  1: 'text-hud-red',
  2: 'text-hud-amber',
  3: 'text-hud-green'
}
const RATING_YIELD: Record<number, string> = { 1: 'LOW', 2: 'MED', 3: 'HIGH' }
const RATING_COST: Record<number, string> = { 1: 'LOW', 2: 'MED', 3: 'HIGH' }
const RATING_SPEED: Record<number, string> = { 1: 'SLOW', 2: 'MED', 3: 'FAST' }

function RatingBadge({ value, labels }: { value: number; labels: Record<number, string> }) {
  return (
    <span className={`font-mono text-[10px] font-bold ${RATING_COLOR[value] ?? 'text-hud-muted'}`}>
      {labels[value] ?? '?'}
    </span>
  )
}

// ── Timer raffinazione ────────────────────────────────────────────────────

function RefineryTimer({
  startTime,
  durationMinutes
}: {
  startTime: number
  durationMinutes: number
}) {
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (durationMinutes <= 0) return null

  const endTime = startTime + durationMinutes * 60 * 1000
  const remaining = endTime - now
  const totalMs = durationMinutes * 60 * 1000
  const progressPct = Math.max(0, Math.min(100, ((totalMs - remaining) / totalMs) * 100))

  if (remaining <= 0) {
    return (
      <div className="flex flex-col items-end gap-0.5">
        <div className="flex items-center gap-1">
          <span
            className="w-1.5 h-1.5 rounded-full bg-hud-green animate-pulse
            shadow-[0_0_6px_rgba(0,232,122,0.8)]"
          />
          <p
            className="font-mono text-xs font-bold text-hud-green
            drop-shadow-[0_0_4px_rgba(0,232,122,0.6)]"
          >
            DONE
          </p>
        </div>
        <div className="w-16 h-0.5 bg-hud-green/30">
          <div className="h-full bg-hud-green w-full" />
        </div>
      </div>
    )
  }

  const totalSec = Math.floor(remaining / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60

  const formatted =
    h > 0
      ? `${h}h ${String(m).padStart(2, '0')}m`
      : `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`

  // Colore urgenza: verde → amber → rosso negli ultimi 30 e 10 min
  const remainingMin = remaining / 60000
  const color =
    remainingMin < 10
      ? { text: 'text-hud-red', bar: 'bg-hud-red', glow: 'shadow-[0_0_6px_rgba(255,64,64,0.7)]' }
      : remainingMin < 30
        ? {
            text: 'text-hud-amber',
            bar: 'bg-hud-amber',
            glow: 'shadow-[0_0_6px_rgba(232,160,32,0.7)]'
          }
        : { text: 'text-hud-cyan', bar: 'bg-hud-cyan', glow: '' }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="flex items-center gap-1">
        <span className={`w-1.5 h-1.5 rounded-full ${color.bar} ${color.glow} animate-pulse`} />
        <Clock className={`h-2.5 w-2.5 ${color.text} shrink-0`} />
        <p className={`font-mono text-xs tabular-nums ${color.text}`}>{formatted}</p>
      </div>
      {/* Progress bar */}
      <div className="w-16 h-0.5 bg-hud-border">
        <div
          className={`h-full ${color.bar} transition-all duration-1000`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  )
}

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

// ── Mineral row data ──────────────────────────────────────────────────────

interface MineralRow {
  key: string
  mineral: string
  scuInput: string
  yieldPercent: string
  yieldManual: boolean
  scuOutput: string // editabile in modalità manuale; se valorizzato è source-of-truth per scuOut
  pricePerScu: string
}

function emptyRow(): MineralRow {
  return {
    key: crypto.randomUUID(),
    mineral: '',
    scuInput: '',
    yieldPercent: '',
    yieldManual: false,
    scuOutput: '',
    pricePerScu: ''
  }
}

// Fattore di conversione: l'utente inserisce in cSCU, lo storage è in SCU
const CSCU = 100

function computeRow(
  row: MineralRow,
  uexYields: { commodity_name: string; terminal_name: string; value: number }[],
  refinery: string
) {
  const uexYield =
    !row.yieldManual && refinery && row.mineral
      ? (uexYields.find(
          (y) =>
            y.commodity_name.toLowerCase().includes(row.mineral.toLowerCase()) &&
            y.terminal_name.toLowerCase().includes(refinery.toLowerCase())
        )?.value ?? null)
      : null

  const effectiveYield = row.yieldManual
    ? parseFloat(row.yieldPercent) || 0
    : (uexYield ?? parseFloat(row.yieldPercent)) || 0

  // Input in cSCU → converti in SCU per i calcoli
  const scuIn = (parseFloat(row.scuInput) || 0) / CSCU
  // scuOutput in modal è anch'esso in cSCU (manual mode)
  const scuOut =
    row.yieldManual && row.scuOutput !== ''
      ? (parseFloat(row.scuOutput) || 0) / CSCU
      : Math.round(((scuIn * effectiveYield) / 100) * CSCU) / CSCU
  const price = parseFloat(row.pricePerScu) || 0
  const estVal = Math.round(scuOut * price)

  return { effectiveYield, uexYield, scuIn, scuOut, price, estVal }
}

// ── Minerals table (inside modal) ─────────────────────────────────────────

function MineralsTable({
  rows,
  refinery,
  mineralSuggestions,
  yields,
  onChange,
  onAdd,
  onRemove
}: {
  rows: MineralRow[]
  refinery: string
  mineralSuggestions: string[]
  yields: { commodity_name: string; terminal_name: string; value: number }[]
  onChange: (key: string, updates: Partial<MineralRow>) => void
  onAdd: () => void
  onRemove: (key: string) => void
}) {
  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="grid grid-cols-[1fr_5rem_6rem_5rem_6rem_2rem] gap-2 px-1 pb-1">
        {['MINERAL', 'cSCU IN', 'YIELD %', 'cSCU OUT', 'PRICE/SCU', ''].map((h) => (
          <span key={h} className="hud-label text-hud-dim text-right first:text-left">
            {h}
          </span>
        ))}
      </div>

      {rows.map((row) => {
        const { uexYield, scuIn, scuOut, estVal } = computeRow(row, yields, refinery)
        return (
          <div
            key={row.key}
            className="grid grid-cols-[1fr_5rem_6rem_5rem_6rem_2rem] gap-2 items-start"
          >
            {/* Mineral */}
            <ComboInput
              value={row.mineral}
              onChange={(v) => onChange(row.key, { mineral: v })}
              suggestions={mineralSuggestions}
              placeholder="Mineral..."
            />

            {/* SCU Input */}
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={row.scuInput}
              onChange={(e) => onChange(row.key, { scuInput: e.target.value })}
            />

            {/* Yield % */}
            <div className="relative">
              <Input
                type="number"
                min="0"
                max="200"
                placeholder={uexYield !== null ? String(uexYield) : '0'}
                value={
                  row.yieldManual ? row.yieldPercent : uexYield !== null ? String(uexYield) : ''
                }
                disabled={!row.yieldManual}
                className={!row.yieldManual ? 'opacity-60 pr-7' : 'pr-7'}
                onChange={(e) => {
                  const yp = e.target.value
                  // scuIn è in SCU, scuOutput va in cSCU
                  const computed =
                    scuIn > 0
                      ? String(
                          Math.round(((scuIn * (parseFloat(yp) || 0)) / 100) * CSCU * 100) / 100
                        )
                      : ''
                  onChange(row.key, { yieldPercent: yp, scuOutput: computed })
                }}
              />
              {/* Toggle manual/auto */}
              <button
                type="button"
                title={
                  row.yieldManual
                    ? 'Manual mode — click to switch back to auto (UEX)'
                    : 'Auto mode (UEX) — click to enter manually'
                }
                className={[
                  'absolute right-1 top-1/2 -translate-y-1/2',
                  'flex items-center justify-center',
                  'w-5 h-5 text-[8px] font-bold font-mono tracking-wider',
                  'border transition-all duration-150 cursor-pointer select-none',
                  row.yieldManual
                    ? 'bg-hud-purple/20 border-hud-purple text-hud-purple hover:bg-hud-purple/30'
                    : 'bg-hud-deep border-hud-border text-hud-muted hover:border-hud-purple hover:text-hud-purple'
                ].join(' ')}
                onClick={() =>
                  onChange(row.key, {
                    yieldManual: !row.yieldManual,
                    scuOutput: '',
                    yieldPercent: ''
                  })
                }
              >
                {row.yieldManual ? 'M' : 'A'}
              </button>
            </div>

            {/* SCU Output — read-only in auto, editabile in manual */}
            {row.yieldManual ? (
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={row.scuOutput}
                onChange={(e) => {
                  const so = e.target.value
                  // so è in cSCU, scuIn è in SCU
                  const soSCU = (parseFloat(so) || 0) / CSCU
                  const yp = scuIn > 0 ? String(Math.round((soSCU / scuIn) * 100 * 100) / 100) : ''
                  onChange(row.key, { scuOutput: so, yieldPercent: yp })
                }}
              />
            ) : (
              <div className="h-9 border border-hud-border bg-hud-deep/60 px-2 flex items-center justify-end">
                <span
                  className={`font-mono text-xs ${scuOut > 0 ? 'text-hud-purple' : 'text-hud-dim'}`}
                >
                  {scuOut > 0 ? parseFloat((scuOut * CSCU).toFixed(2)) : '—'}
                </span>
              </div>
            )}

            {/* Price / SCU */}
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={row.pricePerScu}
              onChange={(e) => onChange(row.key, { pricePerScu: e.target.value })}
            />

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

            {/* Est. value sotto la riga (inline hint) */}
            {estVal > 0 && (
              <div className="col-span-6 -mt-0.5 flex justify-end pr-8">
                <span className="hud-label text-hud-dim">
                  {row.mineral} → {formatUEC(estVal)} aUEC
                </span>
              </div>
            )}
          </div>
        )
      })}

      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-1.5 hud-label text-hud-purple hover:text-hud-text
          transition-colors py-1 px-1"
      >
        <Plus className="h-3 w-3" />
        ADD MINERAL
      </button>
    </div>
  )
}

// ── Modal aggiunta job ────────────────────────────────────────────────────

interface JobFormData {
  refinery: string
  methodId: string
  durationHours: string
  durationMins: string
  refineCost: string
  notes: string
}

const EMPTY_HEADER: JobFormData = {
  refinery: '',
  methodId: '',
  durationHours: '',
  durationMins: '',
  refineCost: '',
  notes: ''
}

// Converte un LocalRefineryJob → stato del form per l'edit
function jobToForm(
  job: LocalRefineryJob,
  methods: RefineryMethod[]
): { header: JobFormData; rows: MineralRow[] } {
  const method = methods.find((m) => m.name === job.method || m.code === job.methodCode)
  const totalMins = job.refineDurationMinutes ?? 0
  const header: JobFormData = {
    refinery: job.refinery,
    methodId: method ? String(method.id) : '',
    durationHours: totalMins > 0 ? String(Math.floor(totalMins / 60)) : '',
    durationMins: totalMins > 0 ? String(totalMins % 60) : '',
    refineCost: job.refineCost > 0 ? String(job.refineCost) : '',
    notes: job.notes ?? ''
  }
  const rows: MineralRow[] = job.minerals.map((m) => ({
    key: crypto.randomUUID(),
    mineral: m.mineral,
    scuInput: String(Math.round(m.scuInput * CSCU)), // SCU → cSCU per il form
    yieldPercent: String(m.yieldPercent),
    yieldManual: true,
    scuOutput: String(Math.round(m.scuOutput * CSCU)), // SCU → cSCU per il form
    pricePerScu: m.pricePerScu > 0 ? String(m.pricePerScu) : ''
  }))
  return { header, rows: rows.length > 0 ? rows : [emptyRow()] }
}

function AddJobModal({ onClose, editJob }: { onClose: () => void; editJob?: LocalRefineryJob }) {
  const addJob = useAddRefineryJob()
  const updateJob = useUpdateRefineryJob()

  const { data: methods = [], isLoading: methodsLoading } = useRefineryMethods()

  // In edit mode inizializziamo dopo che i methods sono caricati
  const [initialized, setInitialized] = useState(!editJob)
  const [header, setHeader] = useState<JobFormData>(EMPTY_HEADER)
  const [rows, setRows] = useState<MineralRow[]>([emptyRow()])

  useEffect(() => {
    if (editJob && methods.length > 0 && !initialized) {
      const { header: h, rows: r } = jobToForm(editJob, methods)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHeader(h)

      setRows(r)

      setInitialized(true)
    }
  }, [editJob, methods, initialized])

  const { data: yields = [] } = useRefineryYields()
  const { commodities, getRefineries } = useStaticData()

  const mineralSuggestions = useMemo(
    () => commodities.filter((c) => c.is_raw === 1 || c.kind === 'Raw').map((c) => c.name),
    [commodities]
  )

  const refinerySuggestions = useMemo(
    () => getRefineries().map((s) => s.name),

    [getRefineries]
  )

  const selectedMethod: RefineryMethod | undefined = useMemo(
    () => methods.find((m) => String(m.id) === header.methodId),
    [methods, header.methodId]
  )

  const rowComputations = useMemo(
    () => rows.map((r) => computeRow(r, yields, header.refinery)),
    [rows, yields, header.refinery]
  )

  const totalEstValue = rowComputations.reduce((a, c) => a + c.estVal, 0)
  const refineCost = parseFloat(header.refineCost) || 0
  const netProfit = totalEstValue - refineCost

  const setHeaderField = (key: keyof JobFormData, value: string) =>
    setHeader((prev) => ({ ...prev, [key]: value }))

  const updateRow = (key: string, updates: Partial<MineralRow>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...updates } : r)))

  const addRow = () => setRows((prev) => [...prev, emptyRow()])

  const removeRow = (key: string) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev))

  const isValid =
    header.refinery.trim() &&
    header.methodId &&
    rows.some((r) => r.mineral.trim() && (parseFloat(r.scuInput) || 0) > 0)

  const handleSubmit = async () => {
    const method = methods.find((m) => String(m.id) === header.methodId)
    const minerals: RefineryMineral[] = rows
      .filter((r) => r.mineral.trim() && (parseFloat(r.scuInput) || 0) > 0)
      .map((r, i) => {
        const c = rowComputations[i]
        return {
          mineral: r.mineral.trim(),
          scuInput: c.scuIn,
          yieldPercent: c.effectiveYield,
          scuOutput: c.scuOut,
          pricePerScu: c.price,
          estimatedValue: c.estVal
        }
      })

    const refineDurationMinutes =
      (parseInt(header.durationHours) || 0) * 60 + (parseInt(header.durationMins) || 0)

    const payload = {
      refinery: header.refinery.trim(),
      method: method?.name ?? '',
      methodCode: method?.code ?? '',
      minerals,
      totalEstimatedValue: Math.round(totalEstValue),
      refineCost,
      netProfit: Math.round(netProfit),
      refineDurationMinutes,
      notes: header.notes.trim()
    }

    if (editJob) {
      // Mantieni id e dateAdded originali → il timer continua a scorrere
      await updateJob.mutateAsync({ ...editJob, ...payload })
    } else {
      await addJob.mutateAsync(payload)
    }
    onClose()
  }

  const isPending = addJob.isPending || updateJob.isPending

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      variants={BACKDROP_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        className="w-full max-w-4xl bg-hud-panel border border-hud-border shadow-[0_0_40px_rgba(160,96,255,0.08)]"
        variants={MODAL_VARIANTS}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-hud-border">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-hud-purple" />
            <span className="hud-label text-hud-text tracking-widest">
              {editJob ? 'EDIT REFINERY JOB' : 'LOG REFINERY JOB'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-hud-muted hover:text-hud-red transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto scrollbar-hud">
          {/* ── Header job ── */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="REFINERY LOCATION" required>
              <ComboInput
                value={header.refinery}
                onChange={(v) => setHeaderField('refinery', v)}
                suggestions={refinerySuggestions}
                placeholder="e.g. Shubin SCD-1"
              />
            </Field>

            <Field label="REFINING METHOD" required>
              {methodsLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <select
                  className="w-full h-9 border border-hud-border bg-hud-deep px-3 text-sm text-hud-text font-mono
                    focus:outline-none focus:border-hud-purple focus:shadow-[0_0_0_1px_rgba(160,96,255,0.2)]
                    transition-[border-color,box-shadow] duration-150"
                  value={header.methodId}
                  onChange={(e) => setHeaderField('methodId', e.target.value)}
                >
                  <option value="">— Select Method —</option>
                  {methods.map((m) => (
                    <option key={m.id} value={String(m.id)}>
                      {m.name}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>

          {/* Rating metodo */}
          {selectedMethod && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'YIELD', value: selectedMethod.rating_yield, labels: RATING_YIELD },
                { label: 'COST', value: selectedMethod.rating_cost, labels: RATING_COST },
                { label: 'SPEED', value: selectedMethod.rating_speed, labels: RATING_SPEED }
              ].map(({ label, value, labels }) => (
                <div key={label} className="hud-panel p-2 text-center">
                  <p className="hud-label text-hud-dim">{label}</p>
                  <RatingBadge value={value} labels={labels} />
                </div>
              ))}
            </div>
          )}

          {/* ── Minerals table ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="hud-label text-hud-muted">MINERALS</span>
              <div className="flex-1 h-px bg-hud-border" />
              <span className="hud-label text-hud-dim">Yield: A=auto (UEX) · M=manual</span>
            </div>
            <MineralsTable
              rows={rows}
              refinery={header.refinery}
              mineralSuggestions={mineralSuggestions}
              yields={yields}
              onChange={updateRow}
              onAdd={addRow}
              onRemove={removeRow}
            />
          </div>

          {/* ── Totali ── */}
          {totalEstValue > 0 && (
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-hud-border">
              <div className="hud-panel p-2 text-center">
                <p className="hud-label text-hud-dim">EST. VALUE</p>
                <p className="font-mono text-sm text-hud-cyan">{formatUEC(totalEstValue)}</p>
              </div>
              <div className="hud-panel p-2 text-center">
                <p className="hud-label text-hud-dim">REFINE COST</p>
                <p className="font-mono text-sm text-hud-amber">{formatUEC(refineCost)}</p>
              </div>
              <div className="hud-panel p-2 text-center">
                <p className="hud-label text-hud-dim">NET PROFIT</p>
                <p
                  className={`font-mono text-sm font-bold ${netProfit >= 0 ? 'text-hud-green' : 'text-hud-red'}`}
                >
                  {netProfit >= 0 ? '+' : ''}
                  {formatUEC(netProfit)}
                </p>
              </div>
            </div>
          )}

          {/* ── Footer campi ── */}
          <div className="grid grid-cols-2 gap-3">
            {/* Durata raffinazione */}
            <Field label="REFINE DURATION">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={header.durationHours}
                    onChange={(e) => setHeaderField('durationHours', e.target.value)}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 hud-label text-hud-dim pointer-events-none">
                    h
                  </span>
                </div>
                <div className="flex-1 relative">
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
                    value={header.durationMins}
                    onChange={(e) => setHeaderField('durationMins', e.target.value)}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 hud-label text-hud-dim pointer-events-none">
                    m
                  </span>
                </div>
              </div>
            </Field>

            <Field label="REFINING COST (aUEC)">
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={header.refineCost}
                onChange={(e) => setHeaderField('refineCost', e.target.value)}
              />
            </Field>
          </div>

          <Field label="NOTES">
            <Input
              placeholder="Optional..."
              value={header.notes}
              onChange={(e) => setHeaderField('notes', e.target.value)}
            />
          </Field>
        </div>

        {/* Footer modal */}
        <div className="flex gap-2 px-5 py-3 border-t border-hud-border">
          <Button variant="hud-ghost" className="flex-1" onClick={onClose}>
            CANCEL
          </Button>
          <Button
            variant="hud"
            className="flex-1 border-hud-purple/60 text-hud-purple hover:bg-hud-purple/10"
            onClick={handleSubmit}
            disabled={!isValid || isPending}
          >
            {isPending ? (editJob ? 'SAVING...' : 'LOGGING...') : editJob ? 'SAVE JOB' : 'LOG JOB'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Helpers display ───────────────────────────────────────────────────────

function fScu(n: number): string {
  return parseFloat(n.toFixed(2)).toString()
}

// ── Riga job nella lista ──────────────────────────────────────────────────

function JobRow({
  job,
  selected,
  onSelect,
  onEdit,
  onSell,
  onRemove
}: {
  job: LocalRefineryJob
  selected: boolean
  onSelect: () => void
  onEdit: () => void
  onSell: () => void
  onRemove: () => void
}) {
  const isProfit = job.netProfit >= 0
  const totalScuIn = job.minerals.reduce((a, m) => a + m.scuInput, 0)
  const totalScuOut = parseFloat(job.minerals.reduce((a, m) => a + m.scuOutput, 0).toFixed(2))
  const hasValue = job.totalEstimatedValue > 0
  const hasSellable = job.minerals.some((m) => m.scuOutput > 0)

  const menuItems = [
    {
      label: 'Edit Job',
      icon: (
        <svg
          className="h-3 w-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
      onClick: onEdit
    },
    ...(hasSellable
      ? [
          {
            label: 'Create Sell Trade',
            icon: <ShoppingCart className="h-3 w-3" />,
            onClick: onSell
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
      transition-colors duration-150 ${selected ? 'bg-hud-green/5 border-l-2 border-l-hud-green/50' : ''}`}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-start">
          {/* Colonna sinistra: checkbox + info + minerali */}
          <div className="min-w-0 flex gap-3 items-start">
            {/* Checkbox selezione */}
            <button
              onClick={onSelect}
              title={selected ? 'Deselect' : 'Select for sell'}
              className={`mt-0.5 w-4 h-4 border shrink-0 flex items-center justify-center
              transition-all duration-150
              ${
                selected
                  ? 'border-hud-green bg-hud-green/20 text-hud-green'
                  : 'border-hud-border text-transparent hover:border-hud-green/60 hover:bg-hud-green/5'
              }`}
            >
              <span className="text-[10px] font-bold leading-none">✓</span>
            </button>

            <div className="min-w-0 flex flex-col gap-1.5 flex-1">
              {/* Location · method · date */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="font-mono text-sm font-semibold text-hud-text"
                  title={job.refinery}
                >
                  {job.refinery}
                </span>
                <span className="hud-label text-hud-dim">·</span>
                <span
                  className="hud-label text-hud-purple uppercase tracking-widest"
                  title={job.method}
                >
                  {job.method}
                </span>
                <span className="hud-label text-hud-dim ml-auto">
                  {formatRelativeTime(job.dateAdded)}
                </span>
              </div>

              {/* Minerali */}
              <div className="flex flex-wrap gap-1">
                {job.minerals.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 bg-hud-purple/10 border border-hud-purple/20 px-2 py-0.5"
                  >
                    <span className="hud-label text-hud-text" title={m.mineral}>
                      {abbrev(m.mineral)}
                    </span>
                    <span className="hud-label text-hud-dim">
                      {fScu(m.scuInput)} <span className="text-hud-purple">→</span>{' '}
                      {fScu(m.scuOutput)} SCU
                    </span>
                    {m.pricePerScu > 0 && (
                      <span className="hud-label text-hud-cyan">@ {formatUEC(m.pricePerScu)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonna destra: metriche + timer + azioni */}
          <div className="flex items-center gap-4 shrink-0">
            {/* SCU in → out */}
            <div className="text-right">
              <p className="font-mono text-xs text-hud-text">
                {fScu(totalScuIn)} <span className="text-hud-purple">→</span> {fScu(totalScuOut)}
              </p>
              <p className="hud-label text-hud-dim">SCU</p>
            </div>

            {hasValue && (
              <div className="text-right">
                <p className="font-mono text-xs text-hud-cyan">
                  {formatUEC(job.totalEstimatedValue)}
                </p>
                <p className="hud-label text-hud-dim">EST. VALUE</p>
              </div>
            )}

            {(hasValue || job.refineCost > 0) && (
              <div className="text-right">
                <p
                  className={`font-mono text-sm font-bold ${isProfit ? 'text-hud-green' : 'text-hud-red'}`}
                >
                  {isProfit ? '+' : ''}
                  {formatUEC(job.netProfit)}
                </p>
                <p className="hud-label text-hud-dim">PROFIT</p>
              </div>
            )}

            <RefineryTimer
              startTime={job.dateAdded}
              durationMinutes={job.refineDurationMinutes ?? 0}
            />

            {/* Sell (singolo job) */}
            {hasSellable && (
              <button
                onClick={onSell}
                title="Create matching sell trade"
                className="flex items-center gap-1 px-2 h-7 border border-hud-green/30
                text-hud-green/60 hover:border-hud-green/70 hover:text-hud-green hover:bg-hud-green/5
                transition-all duration-150 font-mono text-[10px] tracking-wider"
              >
                <ShoppingCart className="h-3 w-3" />
                SELL
              </button>
            )}

            {/* Remove */}
            <button
              onClick={onRemove}
              title="Remove job"
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

function RefineryStats({ jobs }: { jobs: LocalRefineryJob[] }) {
  const stats = useMemo(
    () => ({
      totalValue: jobs.reduce((a, j) => a + j.totalEstimatedValue, 0),
      totalCost: jobs.reduce((a, j) => a + j.refineCost, 0),
      totalProfit: jobs.reduce((a, j) => a + j.netProfit, 0),
      totalScuIn: jobs.reduce((a, j) => a + j.minerals.reduce((b, m) => b + m.scuInput, 0), 0)
    }),
    [jobs]
  )

  return (
    <div className="grid grid-cols-4 gap-2">
      {[
        {
          label: 'EST. VALUE',
          value: formatUEC(stats.totalValue),
          unit: 'aUEC',
          color: 'text-hud-cyan'
        },
        {
          label: 'REFINE COST',
          value: formatUEC(stats.totalCost),
          unit: 'aUEC',
          color: 'text-hud-amber'
        },
        {
          label: 'NET PROFIT',
          value: formatUEC(stats.totalProfit),
          unit: 'aUEC',
          color: stats.totalProfit >= 0 ? 'text-hud-green' : 'text-hud-red'
        },
        {
          label: 'SCU PROCESSED',
          value: stats.totalScuIn.toLocaleString(),
          unit: 'SCU',
          color: 'text-hud-text'
        }
      ].map((s) => (
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

export function RefineriesView() {
  const { data: jobs = [], isLoading } = useLocalRefineryJobs()
  const removeJob = useRemoveRefineryJob()
  const navigate = useNavigate()
  const { confirm, dialog } = useConfirmDialog()
  const [showModal, setShowModal] = useState(false)
  const [editJob, setEditJob] = useState<LocalRefineryJob | null>(null)
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
    setSelectedIds(selectAll ? new Set(jobs.map((j) => j.id)) : new Set())
  }

  function handleSellJob(job: LocalRefineryJob) {
    navigate('/trades', {
      state: { fromRefinery: true, refineryLocation: job.refinery, refineryJobs: [job] }
    })
  }

  function handleSellSelected() {
    const targets = jobs.filter((j) => selectedIds.has(j.id))
    const allSameRefinery = targets.every((j) => j.refinery === targets[0].refinery)
    navigate('/trades', {
      state: {
        fromRefinery: true,
        refineryLocation: allSameRefinery ? targets[0].refinery : '',
        refineryJobs: targets
      }
    })
    setSelectedIds(new Set())
  }

  const anySelected = selectedIds.size > 0

  function askRemoveJob(id: string, refinery: string) {
    confirm(
      {
        title: 'Remove Job',
        message: `Remove refinery job at "${refinery}"? This cannot be undone.`
      },
      () => removeJob.mutate(id)
    )
  }

  return (
    <div className="relative flex flex-col h-full w-full p-5 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between hud-section-refinery px-3 py-3 border border-hud-purple/20">
        <div className="flex items-center gap-3">
          <FlaskConical className="h-5 w-5 text-hud-purple drop-shadow-[0_0_4px_rgba(160,96,255,0.8)]" />
          <div>
            <h1
              className="font-mono text-sm font-bold tracking-[0.15em] text-hud-purple uppercase"
              style={{ textShadow: '0 0 8px rgba(160,96,255,0.4)' }}
            >
              Refinery Log
            </h1>
            <p className="hud-label mt-0.5 text-hud-muted">{jobs.length} JOBS LOGGED</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {anySelected && (
            <Button
              variant="hud"
              size="sm"
              className="border-hud-green/50 text-hud-green hover:bg-hud-green/10"
              onClick={handleSellSelected}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
              SELL ({selectedIds.size})
            </Button>
          )}
          <Button
            variant="hud"
            size="sm"
            className="border-hud-purple/60 text-hud-purple hover:bg-hud-purple/10"
            onClick={() => setShowModal(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            LOG JOB
          </Button>
        </div>
      </div>

      {jobs.length > 0 && <RefineryStats jobs={jobs} />}

      <div className="flex items-center gap-2 px-4 pb-1">
        <SelectAllCheckbox
          total={jobs.length}
          selected={selectedIds.size}
          onToggle={toggleSelectAll}
          accentColor="hud-green"
        />
        <span className="hud-label text-hud-muted">LOCATION · METHOD · MINERALS</span>
        <div className="flex-1 h-px bg-hud-border" />
        {anySelected && (
          <span className="hud-label text-hud-green">{selectedIds.size} SELECTED</span>
        )}
        <span className="hud-label text-hud-dim">SCU · VALUE · PROFIT · TIMER</span>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3">
          <div className="border border-hud-purple/20 bg-hud-purple/5 p-8">
            <TrendingUp
              className="h-12 w-12 text-hud-purple/40 mx-auto mb-3
              drop-shadow-[0_0_8px_rgba(160,96,255,0.3)]"
            />
            <p className="hud-label text-hud-purple text-center">NO REFINERY JOBS LOGGED</p>
            <p className="hud-label text-hud-dim text-center mt-1">
              Log your first job to track yields and profits
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
            {jobs.map((job) => (
              <motion.div key={job.id} variants={ROW_VARIANTS} layout="position">
                <JobRow
                  job={job}
                  selected={selectedIds.has(job.id)}
                  onSelect={() => toggleSelect(job.id)}
                  onEdit={() => setEditJob(job)}
                  onSell={() => handleSellJob(job)}
                  onRemove={() => askRemoveJob(job.id, job.refinery)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Floating bulk-sell — appare solo con selezioni attive */}
      {anySelected && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={handleSellSelected}
            className="flex items-center gap-2 px-5 py-2.5
              bg-hud-deep border border-hud-green/60 text-hud-green
              font-mono text-xs tracking-widest uppercase
              hover:bg-hud-green/10 hover:border-hud-green hover:shadow-[0_0_20px_rgba(0,232,122,0.25)]
              active:bg-hud-green/20 transition-all duration-150
              shadow-[0_4px_24px_rgba(0,0,0,0.7)]"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            SELL {selectedIds.size} JOB{selectedIds.size > 1 ? 'S' : ''}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedIds(new Set())
              }}
              className="ml-1 text-hud-green/40 hover:text-hud-green transition-colors"
              title="Clear selection"
            >
              <X className="h-3 w-3" />
            </button>
          </button>
        </div>
      )}

      <AnimatePresence>
        {showModal && <AddJobModal key="add-job" onClose={() => setShowModal(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {editJob && (
          <AddJobModal key="edit-job" editJob={editJob} onClose={() => setEditJob(null)} />
        )}
      </AnimatePresence>
      {dialog}
    </div>
  )
}
