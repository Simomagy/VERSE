import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@renderer/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

// ── Variants ──────────────────────────────────────────────────────────────────

const DROPDOWN_VARIANTS = {
  initial: { opacity: 0, y: -4, scaleY: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scaleY: 1,
    transition: { duration: 0.12, ease: 'easeOut' as const }
  },
  exit: {
    opacity: 0,
    y: -4,
    scaleY: 0.95,
    transition: { duration: 0.1 }
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  className
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen((prev) => !prev)
    }
    if (e.key === 'Escape') setOpen(false)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const idx = options.findIndex((o) => o.value === value)
      const next = options[Math.min(idx + 1, options.length - 1)]
      if (next) onValueChange(next.value)
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const idx = options.findIndex((o) => o.value === value)
      const prev = options[Math.max(idx - 1, 0)]
      if (prev) onValueChange(prev.value)
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger */}
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex h-9 w-full items-center justify-between border border-hud-border bg-hud-deep px-3 py-2',
          'text-sm text-hud-text font-mono',
          'focus-visible:outline-none focus-visible:border-hud-cyan',
          'focus-visible:shadow-[0_0_0_1px_rgba(0,229,255,0.2)]',
          'hover:border-hud-cyan/40',
          'disabled:cursor-not-allowed disabled:opacity-40',
          'transition-[border-color,box-shadow] duration-150 cursor-pointer',
          open && 'border-hud-cyan shadow-[0_0_0_1px_rgba(0,229,255,0.2)]'
        )}
      >
        <span className={cn(selectedOption ? 'text-hud-text' : 'text-hud-dim')}>
          {selectedOption?.label ?? placeholder ?? '—'}
        </span>
        <ChevronDown
          className={cn(
            'ml-2 h-3.5 w-3.5 shrink-0 text-hud-muted transition-transform duration-150',
            open && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="dropdown"
            role="listbox"
            variants={DROPDOWN_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ transformOrigin: 'top' }}
            className="absolute left-0 right-0 top-full z-50 mt-px border border-hud-cyan/30 bg-hud-panel overflow-hidden"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onValueChange(opt.value)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2',
                    'font-mono text-xs tracking-wider transition-colors duration-100',
                    isSelected
                      ? 'bg-hud-cyan/10 text-hud-cyan'
                      : 'text-hud-muted hover:bg-hud-cyan/5 hover:text-hud-text'
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="h-3 w-3 shrink-0" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
