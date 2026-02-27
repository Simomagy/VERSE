import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Ship, Plus, Trash2, Search, X, Package, ChevronRight, Pencil, Check } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { useLocalFleet, useAddShip, useUpdateShip, useRemoveShip } from '../hooks/useFleet'
import { useWikiVehicles } from '../hooks/useWikiVehicles'
import { BACKDROP_VARIANTS, MODAL_VARIANTS, LIST_VARIANTS, ROW_VARIANTS } from '../lib/animations'
import type { LocalShip, WikiVehicle } from '../api/types'

const SIZE_LABELS: Record<string, string> = {
  vehicle: 'VEH',
  snub: 'SNUB',
  small: 'S',
  medium: 'M',
  large: 'L',
  capital: 'CAP'
}

// ── Ship card con edit inline del nickname ────────────────────────────────
function ShipCard({
  ship,
  onRemove,
  onUpdateNickname
}: {
  ship: LocalShip
  onRemove: () => void
  onUpdateNickname: (nickname: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(ship.nickname)

  const confirmEdit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== ship.nickname) onUpdateNickname(trimmed)
    setEditing(false)
  }

  const cancelEdit = () => {
    setDraft(ship.nickname)
    setEditing(false)
  }

  return (
    <div className="hud-panel hud-panel-fleet group relative p-4 hover:border-hud-blue/50 transition-colors duration-150">
      {/* Angolo decorativo top-left blu */}
      <span className="absolute top-0 left-0 w-4 h-px bg-hud-blue" />
      <span className="absolute top-0 left-0 h-4 w-px bg-hud-blue" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Icona */}
          <div className="mt-0.5 p-1.5 border border-hud-blue/30 bg-hud-blue/5 shrink-0">
            <Ship className="h-4 w-4 text-hud-blue" />
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex items-center gap-1.5 mb-0.5">
                <Input
                  className="h-6 text-xs px-2"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmEdit()
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  autoFocus
                />
                <button
                  onClick={confirmEdit}
                  className="p-1 text-hud-green hover:text-hud-green/80 transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={cancelEdit}
                  className="p-1 text-hud-muted hover:text-hud-red transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <p className="font-mono text-sm font-bold text-hud-text tracking-wide truncate">
                {ship.nickname}
              </p>
            )}
            <p className="hud-label text-hud-muted mt-0.5 truncate">{ship.wikiName}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge variant="outline">{ship.manufacturer}</Badge>
              <Badge variant="secondary">{SIZE_LABELS[ship.size] ?? ship.size}</Badge>
              <Badge variant="secondary">{ship.role}</Badge>
              {ship.cargoCapacity > 0 && (
                <Badge variant="cyan">
                  <Package className="h-2.5 w-2.5 mr-1" />
                  {ship.cargoCapacity} SCU
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Actions (visibili on hover) */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {!editing && (
            <Button
              variant="hud-ghost"
              size="icon"
              className="border-hud-blue/30 text-hud-muted hover:text-hud-blue hover:border-hud-blue"
              onClick={() => {
                setDraft(ship.nickname)
                setEditing(true)
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="hud-ghost"
            size="icon"
            className="border-hud-red/40 text-hud-muted hover:text-hud-red hover:border-hud-red"
            onClick={onRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Modal aggiunta nave ───────────────────────────────────────────────────
function AddShipModal({
  onClose,
  vehicles,
  loadingVehicles
}: {
  onClose: () => void
  vehicles: WikiVehicle[]
  loadingVehicles: boolean
}) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<WikiVehicle | null>(null)
  const [nickname, setNickname] = useState('')
  const addShip = useAddShip()

  const filtered = useMemo(() => {
    if (!search.trim()) return vehicles.slice(0, 40)
    const q = search.toLowerCase()
    return vehicles.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.manufacturer?.name.toLowerCase().includes(q) ||
        v.role?.toLowerCase().includes(q)
    )
  }, [search, vehicles])

  const handleConfirm = async () => {
    if (!selected) return
    await addShip.mutateAsync({
      nickname: nickname.trim() || selected.name,
      wikiSlug: selected.slug,
      wikiName: selected.name,
      manufacturer: selected.manufacturer?.name ?? '',
      role: selected.role ?? '',
      size: selected.size ?? '',
      cargoCapacity: selected.cargo_capacity ?? 0
    })
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
        className="w-full max-w-xl bg-hud-panel border border-hud-border shadow-[0_0_40px_rgba(0,229,255,0.1)] flex flex-col max-h-[80vh]"
        variants={MODAL_VARIANTS}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-hud-border shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-hud-blue" style={{ boxShadow: '0 0 6px #4080ff' }} />
            <span className="hud-label text-hud-blue tracking-widest">ADD VESSEL</span>
          </div>
          <button
            onClick={onClose}
            className="text-hud-muted hover:text-hud-red transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div
              key="search"
              className="flex flex-col flex-1 min-h-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              {/* Search */}
              <div className="px-5 py-3 border-b border-hud-border shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-hud-muted" />
                  <Input
                    className="pl-8 h-8"
                    placeholder="Name, manufacturer, role..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              {/* Lista navi */}
              <div className="flex-1 overflow-y-auto scrollbar-hud">
                {loadingVehicles ? (
                  <div className="p-4 space-y-1">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  filtered.map((v) => (
                    <button
                      key={v.uuid}
                      className="w-full text-left hud-row px-5 py-3 flex items-center justify-between transition-colors"
                      onClick={() => {
                        setSelected(v)
                        setNickname(v.name)
                      }}
                    >
                      <div className="min-w-0">
                        <span className="font-mono text-sm text-hud-text">{v.name}</span>
                        <span className="hud-label text-hud-dim ml-2">{v.manufacturer?.name}</span>
                        <p className="hud-label text-hud-muted mt-0.5">{v.role}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary">{SIZE_LABELS[v.size] ?? v.size}</Badge>
                        {(v.cargo_capacity ?? 0) > 0 && (
                          <Badge variant="cyan">{v.cargo_capacity} SCU</Badge>
                        )}
                        <ChevronRight className="h-3.5 w-3.5 text-hud-muted" />
                      </div>
                    </button>
                  ))
                )}
                {!loadingVehicles && filtered.length === 0 && (
                  <p className="hud-label text-hud-dim text-center py-12">NO VESSELS FOUND</p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              className="p-5 space-y-4"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.15 }}
            >
              {/* Selected ship info */}
              <div className="border border-hud-blue/30 bg-hud-blue/5 p-3">
                <p className="font-mono text-sm font-bold text-hud-blue">{selected.name}</p>
                <p className="hud-label text-hud-muted mt-0.5">
                  {selected.manufacturer?.name} · {selected.role} ·{' '}
                  {SIZE_LABELS[selected.size] ?? selected.size}
                </p>
              </div>

              {/* Nickname */}
              <div>
                <label className="hud-label text-hud-muted mb-2 block">CALLSIGN / NICKNAME</label>
                <Input
                  placeholder={selected.name}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  autoFocus
                />
                <p className="hud-label text-hud-dim mt-1.5">Leave empty to use official name</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button variant="hud-ghost" className="flex-1" onClick={() => setSelected(null)}>
                  BACK
                </Button>
                <Button
                  className="flex-1 border-hud-blue text-hud-blue hover:bg-hud-blue/10
                    hover:shadow-[0_0_12px_rgba(64,128,255,0.35)] font-mono text-xs
                    tracking-widest uppercase bg-transparent border"
                  onClick={handleConfirm}
                  disabled={addShip.isPending}
                >
                  {addShip.isPending ? 'REGISTERING...' : 'REGISTER VESSEL'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────
export function FleetView() {
  const { data: fleet = [], isLoading } = useLocalFleet()
  const { data: vehicles = [], isLoading: loadingVehicles } = useWikiVehicles()
  const updateShip = useUpdateShip()
  const removeShip = useRemoveShip()
  const [showModal, setShowModal] = useState(false)

  const totalScu = fleet.reduce((acc, s) => acc + s.cargoCapacity, 0)

  return (
    <div className="flex flex-col h-full w-full p-5 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between hud-section-fleet px-3 py-3 border border-hud-blue/20">
        <div className="flex items-center gap-3">
          <Ship className="h-5 w-5 text-hud-blue drop-shadow-[0_0_4px_rgba(64,128,255,0.8)]" />
          <div>
            <h1
              className="font-mono text-sm font-bold tracking-[0.15em] text-hud-blue uppercase"
              style={{ textShadow: '0 0 8px rgba(64,128,255,0.4)' }}
            >
              Fleet Registry
            </h1>
            <p className="hud-label mt-0.5 text-hud-muted">
              {fleet.length} {fleet.length === 1 ? 'VESSEL' : 'VESSELS'} REGISTERED
              {totalScu > 0 && <span className="ml-2 text-hud-dim">· {totalScu} SCU TOTAL</span>}
            </p>
          </div>
        </div>
        <Button
          className="border-hud-blue text-hud-blue hover:bg-hud-blue/10
            hover:shadow-[0_0_12px_rgba(64,128,255,0.35)] font-mono text-xs
            tracking-widest uppercase bg-transparent"
          size="sm"
          onClick={() => setShowModal(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          ADD VESSEL
        </Button>
      </div>

      <hr className="hud-divider" />

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : fleet.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3">
          <div className="border border-hud-blue/20 bg-hud-blue/5 p-8">
            <Ship
              className="h-12 w-12 text-hud-blue/40 mx-auto mb-3
              drop-shadow-[0_0_8px_rgba(64,128,255,0.3)]"
            />
            <p className="hud-label text-hud-blue text-center">NO VESSELS REGISTERED</p>
            <p className="hud-label text-hud-muted text-center mt-1">
              {vehicles.length > 0
                ? `${vehicles.length} VESSELS AVAILABLE IN DATABASE`
                : 'Loading database...'}
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-2 overflow-y-auto scrollbar-hud"
          variants={LIST_VARIANTS}
          initial="initial"
          animate="animate"
        >
          <AnimatePresence mode="popLayout">
            {fleet.map((ship) => (
              <motion.div key={ship.id} variants={ROW_VARIANTS} layout="position">
                <ShipCard
                  ship={ship}
                  onUpdateNickname={(nickname) => updateShip.mutate({ ...ship, nickname })}
                  onRemove={() => removeShip.mutate(ship.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {showModal && (
          <AddShipModal
            key="add-ship-modal"
            onClose={() => setShowModal(false)}
            vehicles={vehicles}
            loadingVehicles={loadingVehicles}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
