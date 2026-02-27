import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { cn } from '@renderer/lib/utils'

// ── Component ─────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  title: string
  message?: string
  confirmLabel?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'CONFIRM',
  variant = 'danger',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    confirmRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  const isDanger = variant === 'danger'
  const accentBorder = isDanger ? 'border-hud-red/40' : 'border-hud-cyan/40'
  const accentText = isDanger ? 'text-hud-red' : 'text-hud-cyan'
  const accentBg = isDanger ? 'bg-hud-red/10' : 'bg-hud-cyan/10'
  const accentHover = isDanger
    ? 'hover:bg-hud-red/20 hover:border-hud-red hover:shadow-[0_0_12px_rgba(255,60,60,0.3)]'
    : 'hover:bg-hud-cyan/20 hover:border-hud-cyan hover:shadow-[0_0_12px_rgba(0,229,255,0.3)]'

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        className="relative w-full max-w-sm bg-hud-panel shadow-[0_0_40px_rgba(0,0,0,0.8)]"
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: 'easeOut' } }}
        exit={{ opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.12, ease: 'easeIn' } }}
      >
        {/* Angolini HUD */}
        <span className="absolute top-0 left-0 w-3 h-px bg-hud-red/60" />
        <span className="absolute top-0 left-0 w-px h-3 bg-hud-red/60" />
        <span className="absolute bottom-0 right-0 w-3 h-px bg-hud-red/60" />
        <span className="absolute bottom-0 right-0 w-px h-3 bg-hud-red/60" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-hud-border">
          <div className="flex items-center gap-2.5">
            {isDanger && <AlertTriangle className="h-4 w-4 text-hud-red shrink-0" />}
            <span className="font-mono text-sm font-bold tracking-wider text-hud-text uppercase">
              {title}
            </span>
          </div>
          <button
            onClick={onCancel}
            className="text-hud-muted hover:text-hud-red transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        {message && (
          <div className="px-5 py-4">
            <p className="text-sm text-hud-muted font-mono">{message}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-4 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 h-9 border border-hud-border text-hud-muted font-mono text-xs
              tracking-widest uppercase hover:border-hud-border-glow hover:text-hud-text
              transition-all duration-150"
          >
            CANCEL
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={cn(
              'flex-1 h-9 flex items-center justify-center gap-2 border font-mono text-xs',
              'tracking-widest uppercase transition-all duration-150',
              accentBorder,
              accentText,
              accentBg,
              accentHover
            )}
          >
            {isDanger && <Trash2 className="h-3.5 w-3.5" />}
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────

interface PendingConfirm {
  title: string
  message?: string
  confirmLabel?: string
  variant?: 'danger' | 'default'
  action: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirmDialog() {
  const [pending, setPending] = useState<PendingConfirm | null>(null)

  const confirm = useCallback((opts: Omit<PendingConfirm, 'action'>, action: () => void) => {
    setPending({ ...opts, action })
  }, [])

  const dialog = (
    <AnimatePresence>
      {pending && (
        <ConfirmDialog
          key="confirm-dialog"
          title={pending.title}
          message={pending.message}
          confirmLabel={pending.confirmLabel}
          variant={pending.variant ?? 'danger'}
          onConfirm={() => {
            pending.action()
            setPending(null)
          }}
          onCancel={() => setPending(null)}
        />
      )}
    </AnimatePresence>
  )

  return { confirm, dialog }
}

// ── Select-all checkbox (stesso stile HUD delle row checkboxes) ───────────

interface SelectAllCheckboxProps {
  total: number
  selected: number
  onToggle: (selectAll: boolean) => void
  /** Classe colore Tailwind HUD, es. 'hud-green', 'hud-amber', 'hud-red' */
  accentColor?: string
}

export function SelectAllCheckbox({
  total,
  selected,
  onToggle,
  accentColor = 'hud-cyan'
}: SelectAllCheckboxProps) {
  const allSelected = total > 0 && selected === total
  const someSelected = selected > 0 && selected < total
  const active = allSelected || someSelected

  // Mappa accentColor → classi Tailwind concrete (necessario per PurgeCSS/JIT)
  const colorMap: Record<
    string,
    { border: string; bg: string; text: string; hoverBorder: string; hoverBg: string }
  > = {
    'hud-green': {
      border: 'border-hud-green',
      bg: 'bg-hud-green/20',
      text: 'text-hud-green',
      hoverBorder: 'hover:border-hud-green/60',
      hoverBg: 'hover:bg-hud-green/5'
    },
    'hud-amber': {
      border: 'border-hud-amber',
      bg: 'bg-hud-amber/20',
      text: 'text-hud-amber',
      hoverBorder: 'hover:border-hud-amber/60',
      hoverBg: 'hover:bg-hud-amber/5'
    },
    'hud-red': {
      border: 'border-hud-red',
      bg: 'bg-hud-red/20',
      text: 'text-hud-red',
      hoverBorder: 'hover:border-hud-red/60',
      hoverBg: 'hover:bg-hud-red/5'
    },
    'hud-cyan': {
      border: 'border-hud-cyan',
      bg: 'bg-hud-cyan/20',
      text: 'text-hud-cyan',
      hoverBorder: 'hover:border-hud-cyan/60',
      hoverBg: 'hover:bg-hud-cyan/5'
    }
  }

  const c = colorMap[accentColor] ?? colorMap['hud-cyan']

  return (
    <button
      type="button"
      onClick={() => onToggle(!allSelected)}
      title={allSelected ? 'Deselect all' : 'Select all'}
      className={cn(
        'w-4 h-4 border shrink-0 flex items-center justify-center transition-all duration-150',
        active
          ? `${c.border} ${c.bg} ${c.text}`
          : `border-hud-border text-transparent ${c.hoverBorder} ${c.hoverBg}`
      )}
    >
      {/* Dash per stato parziale, checkmark per tutto selezionato */}
      <span className="text-[10px] font-bold leading-none">{someSelected ? '−' : '✓'}</span>
    </button>
  )
}
