import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LIST_VARIANTS, ROW_VARIANTS } from '../lib/animations'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  SlidersHorizontal,
  Trash2,
  Plus,
  ArrowLeftRight,
  Pencil,
  Check,
  X as XIcon
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Skeleton } from '../components/ui/skeleton'
import { ContextMenu } from '../components/ui/context-menu'
import { useConfirmDialog, SelectAllCheckbox } from '../components/ui/confirm-dialog'
import {
  useWalletEntries,
  useAddWalletEntry,
  useUpdateWalletEntry,
  useRemoveWalletEntry,
  computeBalance
} from '../hooks/useWallet'
import { formatUEC, formatRelativeTime } from '../lib/utils'
import type { LocalWalletEntry, WalletEntryType } from '../api/types'

// ── Costanti ──────────────────────────────────────────────────────────────

const CATEGORIES = ['Trading', 'Mining', 'Refinery', 'Bounty', 'Salvage', 'Mission', 'Other']

const TYPE_CONFIG: Record<
  WalletEntryType,
  {
    label: string
    icon: React.ElementType
    color: string
    border: string
    bg: string
    sign: string
  }
> = {
  income: {
    label: 'INCOME',
    icon: TrendingUp,
    color: 'text-hud-green',
    border: 'border-hud-green/40',
    bg: 'bg-hud-green/10',
    sign: '+'
  },
  expense: {
    label: 'EXPENSE',
    icon: TrendingDown,
    color: 'text-hud-red',
    border: 'border-hud-red/40',
    bg: 'bg-hud-red/10',
    sign: '−'
  },
  adjustment: {
    label: 'ADJUSTMENT',
    icon: SlidersHorizontal,
    color: 'text-hud-amber',
    border: 'border-hud-amber/40',
    bg: 'bg-hud-amber/10',
    sign: '='
  }
}

// ── Quick-add form (inline) ───────────────────────────────────────────────

interface EntryFormData {
  type: WalletEntryType
  amount: string
  description: string
  category: string
}

const EMPTY_FORM: EntryFormData = {
  type: 'income',
  amount: '',
  description: '',
  category: 'Trading'
}

function QuickAddForm() {
  const addEntry = useAddWalletEntry()
  const [form, setForm] = useState<EntryFormData>(EMPTY_FORM)
  const [open, setOpen] = useState(false)

  const set = (key: keyof EntryFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const isValid = (parseFloat(form.amount) || 0) > 0

  const handleSubmit = async () => {
    await addEntry.mutateAsync({
      type: form.type,
      amount: parseFloat(form.amount),
      description: form.description.trim(),
      category: form.category
    })
    setForm(EMPTY_FORM)
    setOpen(false)
  }

  return (
    <AnimatePresence mode="wait">
      {!open ? (
        <motion.div
          key="btn"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          <Button
            variant="hud"
            size="sm"
            className="border-hud-green/60 text-hud-green hover:bg-hud-green/10"
            onClick={() => setOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            ADD ENTRY
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          className="border border-hud-border bg-hud-panel p-4 space-y-3"
          initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
          animate={{
            opacity: [0.5, 0.3, 0.9, 0.7, 1],
            clipPath: 'inset(0 0% 0 0)',
            transition: {
              clipPath: { duration: 0.22, ease: 'easeOut' as const },
              opacity: { duration: 0.32, times: [0, 0.12, 0.45, 0.7, 1], delay: 0.05 }
            }
          }}
          exit={{ opacity: 0, clipPath: 'inset(0 100% 0 0)', transition: { duration: 0.14 } }}
        >
          {/* Tipo operazione */}
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(TYPE_CONFIG) as WalletEntryType[]).map((t) => {
              const cfg = TYPE_CONFIG[t]
              const active = form.type === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('type', t)}
                  className={`py-2 border font-mono text-xs tracking-widest uppercase transition-all duration-150 ${
                    active
                      ? `${cfg.border} ${cfg.bg} ${cfg.color}`
                      : 'border-hud-border text-hud-muted hover:border-hud-border-glow hover:text-hud-text'
                  }`}
                >
                  <cfg.icon className="inline h-3 w-3 mr-1" />
                  {cfg.label}
                </button>
              )
            })}
          </div>

          {/* Importo + categoria */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="hud-label text-hud-muted mb-1.5 block">
                AMOUNT (aUEC)<span className="text-hud-red ml-1">*</span>
              </label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="hud-label text-hud-muted mb-1.5 block">CATEGORY</label>
              <select
                className="w-full h-9 border border-hud-border bg-hud-deep px-3 text-sm text-hud-text font-mono
              focus:outline-none focus:border-hud-green transition-[border-color] duration-150"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descrizione */}
          <div>
            <label className="hud-label text-hud-muted mb-1.5 block">DESCRIPTION</label>
            <Input
              placeholder="e.g. Laranite run Shubin → TDD..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && isValid && handleSubmit()}
            />
          </div>

          {/* Preview importo */}
          {isValid && (
            <p className={`hud-label ${TYPE_CONFIG[form.type].color}`}>
              {TYPE_CONFIG[form.type].sign} {formatUEC(parseFloat(form.amount))} aUEC
              {form.type === 'adjustment' && ' (balance reset)'}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              variant="hud-ghost"
              size="sm"
              className="flex-1"
              onClick={() => {
                setOpen(false)
                setForm(EMPTY_FORM)
              }}
            >
              CANCEL
            </Button>
            <Button
              variant="hud"
              size="sm"
              className="flex-1 border-hud-green/60 text-hud-green hover:bg-hud-green/10"
              disabled={!isValid || addEntry.isPending}
              onClick={handleSubmit}
            >
              {addEntry.isPending ? 'SAVING...' : 'CONFIRM'}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Riga voce ─────────────────────────────────────────────────────────────

function EntryRow({
  entry,
  selected,
  onSelect,
  onRemove
}: {
  entry: LocalWalletEntry
  selected: boolean
  onSelect: () => void
  onRemove: () => void
}) {
  const updateEntry = useUpdateWalletEntry()
  const cfg = TYPE_CONFIG[entry.type]
  const Icon = cfg.icon
  const isAuto = !!entry.sourceId

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({
    amount: '',
    description: '',
    category: '',
    type: entry.type as WalletEntryType
  })

  function openEdit() {
    setDraft({
      amount: String(entry.amount),
      description: entry.description,
      category: entry.category,
      type: entry.type
    })
    setEditing(true)
  }

  async function confirmEdit() {
    const amount = parseFloat(draft.amount)
    if (!amount || amount <= 0) return
    await updateEntry.mutateAsync({
      ...entry,
      type: draft.type,
      amount,
      description: draft.description,
      category: draft.category
    })
    setEditing(false)
  }

  const menuItems = [
    ...(!isAuto
      ? [{ label: 'Edit Entry', icon: <Pencil className="h-3 w-3" />, onClick: openEdit }]
      : []),
    { separator: true as const },
    {
      label: 'Remove',
      icon: <Trash2 className="h-3 w-3" />,
      variant: 'danger' as const,
      onClick: onRemove,
      disabled: isAuto
    }
  ]

  if (editing) {
    const editCfg = TYPE_CONFIG[draft.type]
    return (
      <div className="border-b border-hud-border/40 px-4 py-3 space-y-2 bg-hud-panel/60">
        <div className="grid grid-cols-3 gap-1.5">
          {(Object.keys(TYPE_CONFIG) as WalletEntryType[]).map((t) => {
            const c = TYPE_CONFIG[t]
            const active = draft.type === t
            return (
              <button
                key={t}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, type: t }))}
                className={`py-1.5 border font-mono text-[10px] tracking-widest uppercase transition-all duration-150 ${
                  active
                    ? `${c.border} ${c.bg} ${c.color}`
                    : 'border-hud-border text-hud-muted hover:border-hud-border-glow hover:text-hud-text'
                }`}
              >
                {c.label}
              </button>
            )
          })}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <Input
              type="number"
              min="0"
              autoFocus
              value={draft.amount}
              className="pr-14"
              onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 hud-label text-hud-dim pointer-events-none">
              aUEC
            </span>
          </div>
          <select
            className="h-9 border border-hud-border bg-hud-deep px-3 text-sm text-hud-text font-mono
            focus:outline-none focus:border-hud-cyan transition-[border-color] duration-150"
            value={draft.category}
            onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <Input
          placeholder="Description..."
          value={draft.description}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') confirmEdit()
            if (e.key === 'Escape') setEditing(false)
          }}
        />
        {(parseFloat(draft.amount) || 0) > 0 && (
          <p className={`hud-label ${editCfg.color}`}>
            {editCfg.sign} {formatUEC(parseFloat(draft.amount))} aUEC
          </p>
        )}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setEditing(false)}
            className="flex items-center gap-1 px-2 py-1 hud-label text-hud-muted border border-hud-border hover:text-hud-text hover:border-hud-border-glow transition-all"
          >
            <XIcon className="h-3 w-3" /> CANCEL
          </button>
          <button
            onClick={confirmEdit}
            disabled={updateEntry.isPending || (parseFloat(draft.amount) || 0) <= 0}
            className="flex items-center gap-1 px-2 py-1 hud-label text-hud-green border border-hud-green/40 hover:bg-hud-green/10 hover:border-hud-green disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Check className="h-3 w-3" /> {updateEntry.isPending ? 'SAVING...' : 'CONFIRM'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <ContextMenu items={menuItems}>
      <div
        className={`hud-row group grid grid-cols-[1.25rem_2rem_1fr_auto_6rem_8rem_5rem] gap-3 px-4 py-3 items-center
      transition-colors duration-150 border-b border-hud-border/40 last:border-b-0
      ${selected ? 'bg-hud-red/5 border-l-2 border-l-hud-red/50' : ''} ${isAuto ? 'opacity-90' : ''}`}
      >
        {/* Checkbox selezione */}
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

        {/* Tipo icona */}
        <div className={`flex items-center justify-center w-7 h-7 border ${cfg.border} ${cfg.bg}`}>
          <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
        </div>

        {/* Descrizione + categoria */}
        <div className="min-w-0">
          <p className="font-mono text-sm text-hud-text truncate">
            {entry.description || cfg.label}
          </p>
          <p className="hud-label text-hud-dim">{entry.category}</p>
        </div>

        {/* Badge TRADE — invisible per allineamento se non auto */}
        <span
          className={`flex items-center gap-1 px-1.5 py-0.5 border hud-label shrink-0
        ${isAuto ? 'border-hud-amber/30 bg-hud-amber/5 text-hud-amber/70' : 'invisible'}`}
        >
          <ArrowLeftRight className="h-2.5 w-2.5" />
          TRADE
        </span>

        {/* Data */}
        <div className="text-right">
          <p className="hud-label text-hud-dim">{formatRelativeTime(entry.dateAdded)}</p>
        </div>

        {/* Importo */}
        <div className="text-right">
          <span className={`font-mono text-sm font-bold ${cfg.color}`}>
            {cfg.sign} {formatUEC(entry.amount)}{' '}
            <span className="text-[10px] font-normal">aUEC</span>
          </span>
        </div>

        {/* Azioni — stile coerente con Trades/Refineries */}
        <div className="flex items-center gap-1 justify-end">
          {/* Edit — invisible per auto-generate */}
          <button
            onClick={openEdit}
            title="Edit"
            className={`flex items-center justify-center w-7 h-7 border border-hud-border
            text-hud-dim hover:border-hud-cyan/60 hover:text-hud-cyan hover:bg-hud-cyan/5
            transition-all duration-150
            ${isAuto ? 'invisible pointer-events-none' : ''}`}
          >
            <Pencil className="h-3 w-3" />
          </button>
          {/* Remove */}
          {isAuto ? (
            <span
              title="Managed automatically by trades"
              className="flex items-center justify-center w-7 h-7 border border-hud-border/30 text-hud-border cursor-not-allowed"
            >
              <Trash2 className="h-3 w-3" />
            </span>
          ) : (
            <button
              onClick={onRemove}
              title="Remove"
              className="flex items-center justify-center w-7 h-7 border border-hud-border
              text-hud-dim hover:border-hud-red/60 hover:text-hud-red hover:bg-hud-red/5
              transition-all duration-150"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </ContextMenu>
  )
}

// ── Stats panel ───────────────────────────────────────────────────────────

function WalletStats({ entries, balance }: { entries: LocalWalletEntry[]; balance: number }) {
  const stats = useMemo(() => {
    const income = entries.filter((e) => e.type === 'income').reduce((a, e) => a + e.amount, 0)
    const expense = entries.filter((e) => e.type === 'expense').reduce((a, e) => a + e.amount, 0)
    return { income, expense }
  }, [entries])

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="hud-panel p-3">
        <p className="hud-label text-hud-muted">TOTAL INCOME</p>
        <p className="font-mono text-lg font-bold mt-1 text-hud-green">{formatUEC(stats.income)}</p>
        <p className="hud-label text-hud-dim">aUEC</p>
      </div>
      <div className="hud-panel p-3">
        <p className="hud-label text-hud-muted">TOTAL EXPENSES</p>
        <p className="font-mono text-lg font-bold mt-1 text-hud-red">{formatUEC(stats.expense)}</p>
        <p className="hud-label text-hud-dim">aUEC</p>
      </div>
      <div className="hud-panel p-3">
        <p className="hud-label text-hud-muted">CURRENT BALANCE</p>
        <p
          className={`font-mono text-lg font-bold mt-1 ${balance >= 0 ? 'text-hud-cyan' : 'text-hud-red'}`}
        >
          {formatUEC(balance)}
        </p>
        <p className="hud-label text-hud-dim">aUEC</p>
      </div>
    </div>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────

type FilterType = 'all' | WalletEntryType | 'trade'

export function WalletView() {
  const { data: entries = [], isLoading } = useWalletEntries()
  const removeEntry = useRemoveWalletEntry()
  const { confirm, dialog } = useConfirmDialog()
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const balance = useMemo(() => computeBalance(entries), [entries])

  const filtered = useMemo(() => {
    if (filter === 'all') return entries
    if (filter === 'trade') return entries.filter((e) => !!e.sourceId)
    return entries.filter((e) => e.type === filter)
  }, [entries, filter])

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll(selectAll: boolean) {
    const deletable = filtered.filter((e) => !e.sourceId).map((e) => e.id)
    setSelectedIds(selectAll ? new Set(deletable) : new Set())
  }

  const deletableCount = [...selectedIds].filter(
    (id) => !entries.find((e) => e.id === id)?.sourceId
  ).length
  const anySelected = selectedIds.size > 0

  function handleBulkDelete() {
    confirm(
      {
        title: 'Delete Entries',
        message: `Delete ${deletableCount} wallet entr${deletableCount === 1 ? 'y' : 'ies'}? This cannot be undone.`
      },
      () => {
        ;[...selectedIds]
          .filter((id) => !entries.find((e) => e.id === id)?.sourceId)
          .forEach((id) => removeEntry.mutate(id))
        setSelectedIds(new Set())
      }
    )
  }

  function askRemoveEntry(entry: LocalWalletEntry) {
    confirm(
      {
        title: 'Remove Entry',
        message: `Remove "${entry.description || entry.type}" (${formatUEC(entry.amount)})?`
      },
      () => removeEntry.mutate(entry.id)
    )
  }

  const FILTERS: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'ALL' },
    { id: 'income', label: 'INCOME' },
    { id: 'expense', label: 'EXPENSE' },
    { id: 'adjustment', label: 'ADJUSTMENT' },
    { id: 'trade', label: 'TRADE' }
  ]

  return (
    <div className="relative flex flex-col h-full w-full p-5 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between hud-section-wallet px-3 py-3 border border-hud-green/20">
        <div className="flex items-center gap-3">
          <Wallet className="h-5 w-5 text-hud-green drop-shadow-[0_0_4px_rgba(0,232,122,0.8)]" />
          <div>
            <h1
              className="font-mono text-sm font-bold tracking-[0.15em] text-hud-green uppercase"
              style={{ textShadow: '0 0 8px rgba(0,232,122,0.4)' }}
            >
              Wallet
            </h1>
            <p className="hud-label mt-0.5 text-hud-muted">{entries.length} ENTRIES LOGGED</p>
          </div>
        </div>
        <QuickAddForm />
      </div>

      {entries.length > 0 && <WalletStats entries={entries} balance={balance} />}

      {/* Filtri */}
      <div className="flex items-center gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={`px-3 py-1 hud-label transition-colors duration-100 ${
              filter === f.id
                ? 'text-hud-green border-b border-hud-green'
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
      <div className="grid grid-cols-[1.25rem_2rem_1fr_auto_6rem_8rem_5rem] gap-3 px-4 pb-1">
        <SelectAllCheckbox
          total={filtered.filter((e) => !e.sourceId).length}
          selected={
            [...selectedIds].filter((id) => !entries.find((e) => e.id === id)?.sourceId).length
          }
          onToggle={toggleSelectAll}
          accentColor="hud-green"
        />
        <span className="hud-label" />
        <span className="hud-label">DESCRIPTION / CATEGORY</span>
        <span className="hud-label">SOURCE</span>
        <span className="hud-label text-right">WHEN</span>
        <span className="hud-label text-right">AMOUNT</span>
        <span />
      </div>
      <hr className="hud-divider" />

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3">
          <div className="border border-hud-green/20 bg-hud-green/5 p-8">
            <Wallet className="h-12 w-12 text-hud-green/40 mx-auto mb-3 drop-shadow-[0_0_8px_rgba(0,232,122,0.3)]" />
            <p className="hud-label text-hud-green text-center">
              {entries.length === 0 ? 'NO ENTRIES LOGGED' : 'NO ENTRIES WITH THIS FILTER'}
            </p>
            {entries.length === 0 && (
              <p className="hud-label text-hud-dim text-center mt-1">
                Use ADD ENTRY to record income, expenses or balance snapshots
              </p>
            )}
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
            {filtered.map((entry) => (
              <motion.div key={entry.id} variants={ROW_VARIANTS} layout="position">
                <EntryRow
                  entry={entry}
                  selected={selectedIds.has(entry.id)}
                  onSelect={() => toggleSelect(entry.id)}
                  onRemove={() => askRemoveEntry(entry)}
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
            disabled={deletableCount === 0}
            className="flex items-center gap-2 px-5 py-2.5
              bg-hud-deep border border-hud-red/60 text-hud-red
              font-mono text-xs tracking-widest uppercase
              hover:bg-hud-red/10 hover:border-hud-red hover:shadow-[0_0_20px_rgba(255,60,60,0.25)]
              disabled:opacity-40 disabled:cursor-not-allowed
              active:bg-hud-red/20 transition-all duration-150
              shadow-[0_4px_24px_rgba(0,0,0,0.7)]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            DELETE {deletableCount > 0 ? deletableCount : selectedIds.size} ENTR
            {deletableCount === 1 ? 'Y' : 'IES'}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedIds(new Set())
              }}
              className="ml-1 text-hud-red/40 hover:text-hud-red transition-colors"
              title="Clear selection"
            >
              <XIcon className="h-3 w-3" />
            </button>
          </button>
        </div>
      )}

      {dialog}
    </div>
  )
}
