import { useState, useRef, useCallback, useId } from 'react'

const MAX_SUGGESTIONS = 8

interface ComboInputProps {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
  disabled?: boolean
}

export function ComboInput({
  value,
  onChange,
  suggestions,
  placeholder,
  disabled
}: ComboInputProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const listId = useId()

  const filtered = value.trim().length === 0
    ? []
    : suggestions
        .filter((s) => s.toLowerCase().includes(value.toLowerCase().trim()))
        .slice(0, MAX_SUGGESTIONS)

  const select = useCallback(
    (item: string) => {
      onChange(item)
      setOpen(false)
      setActiveIndex(-1)
      inputRef.current?.blur()
    },
    [onChange]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || filtered.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      select(filtered[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  const handleFocus = () => {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current)
    setOpen(true)
    setActiveIndex(-1)
  }

  const handleBlur = () => {
    blurTimerRef.current = setTimeout(() => {
      setOpen(false)
      setActiveIndex(-1)
    }, 150)
  }

  const shouldShow = open && filtered.length > 0

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          setActiveIndex(-1)
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        className="flex h-9 w-full border border-hud-border bg-hud-deep px-3 py-1 text-sm
          font-mono text-hud-text placeholder:text-hud-dim
          focus-visible:outline-none focus-visible:border-hud-cyan
          focus-visible:shadow-[0_0_0_1px_rgba(0,229,255,0.15)]
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-[border-color,box-shadow] duration-150"
      />

      {shouldShow && (
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          className="absolute z-50 top-full left-0 right-0 mt-px
            border border-hud-border bg-hud-panel
            shadow-[0_4px_24px_rgba(0,0,0,0.6),0_0_1px_rgba(0,229,255,0.1)]
            max-h-52 overflow-y-auto scrollbar-hud"
        >
          {filtered.map((item, i) => (
            <li
              key={item}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault()
                select(item)
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`px-3 py-2 font-mono text-xs tracking-wide cursor-pointer transition-colors duration-75 ${
                i === activeIndex
                  ? 'bg-hud-cyan/10 text-hud-cyan border-l-2 border-hud-cyan'
                  : 'text-hud-text hover:bg-hud-dim/20 border-l-2 border-transparent'
              }`}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
