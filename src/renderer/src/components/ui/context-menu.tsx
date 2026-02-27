import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@renderer/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────

interface ContextMenuAction {
  label: string
  icon?: React.ReactNode
  variant?: 'default' | 'danger'
  disabled?: boolean
  onClick: () => void
  separator?: never
}

interface ContextMenuDivider {
  separator: true
  label?: never
  icon?: never
  variant?: never
  disabled?: never
  onClick?: never
}

export type ContextMenuItemDef = ContextMenuAction | ContextMenuDivider

interface ContextMenuProps {
  items: ContextMenuItemDef[]
  children: React.ReactNode
  className?: string
}

interface Position {
  x: number
  y: number
}

// ── Menu overlay (rendered via portal) ───────────────────────────────────

function MenuOverlay({
  items,
  position,
  onClose
}: {
  items: ContextMenuItemDef[]
  position: Position
  onClose: () => void
}) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Chiude su click esterno o Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [onClose])

  // Aggiusta la posizione per non uscire dallo schermo
  const vw = window.innerWidth
  const vh = window.innerHeight
  const MENU_W = 192 // stimato
  const MENU_H = items.length * 32 + 8

  const left = position.x + MENU_W > vw ? vw - MENU_W - 8 : position.x
  const top = position.y + MENU_H > vh ? vh - MENU_H - 8 : position.y

  return createPortal(
    <div
      ref={menuRef}
      style={{ left, top }}
      className={cn(
        'fixed z-[9999] min-w-48 py-1',
        'bg-hud-deep',
        'shadow-[0_4px_24px_rgba(0,0,0,0.7),0_0_0_1px_rgba(0,229,255,0.06)]',
        'animate-in fade-in-0 zoom-in-95 duration-100'
      )}
    >
      {/* Angolini HUD */}
      <span className="absolute top-0 left-0 w-2 h-px bg-hud-cyan/60" />
      <span className="absolute top-0 left-0 w-px h-2 bg-hud-cyan/60" />
      <span className="absolute bottom-0 right-0 w-2 h-px bg-hud-cyan/60" />
      <span className="absolute bottom-0 right-0 w-px h-2 bg-hud-cyan/60" />

      {items.map((item, i) => {
        if (item.separator) {
          return <div key={i} className="my-1 mx-2 h-px bg-hud-border" />
        }

        const isDanger = item.variant === 'danger'

        return (
          <button
            key={i}
            disabled={item.disabled}
            onClick={() => {
              if (!item.disabled) {
                item.onClick()
                onClose()
              }
            }}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-1.5',
              'font-mono text-[11px] tracking-wider uppercase text-left',
              'transition-colors duration-100',
              'disabled:opacity-30 disabled:cursor-not-allowed',
              isDanger
                ? 'text-hud-red/70 hover:text-hud-red hover:bg-hud-red/8'
                : 'text-hud-muted hover:text-hud-text hover:bg-hud-cyan/5'
            )}
          >
            {item.icon && (
              <span className={cn('shrink-0', isDanger ? 'text-hud-red/60' : 'text-hud-cyan/60')}>
                {item.icon}
              </span>
            )}
            {item.label}
          </button>
        )
      })}
    </div>,
    document.body
  )
}

// ── ContextMenu wrapper ───────────────────────────────────────────────────

export function ContextMenu({ items, children, className }: ContextMenuProps) {
  const [position, setPosition] = useState<Position | null>(null)

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPosition({ x: e.clientX, y: e.clientY })
  }, [])

  const close = useCallback(() => setPosition(null), [])

  return (
    <>
      <div onContextMenu={handleContextMenu} className={cn('contents', className)}>
        {children}
      </div>
      {position && <MenuOverlay items={items} position={position} onClose={close} />}
    </>
  )
}
