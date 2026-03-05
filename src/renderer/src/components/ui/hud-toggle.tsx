interface HudToggleProps {
  value: boolean
  onChange: (v: boolean) => void
  label?: string
  disabled?: boolean
  icon?: React.ReactNode
  color?: 'hud-cyan' | 'hud-green' | 'hud-red' | 'hud-amber' | 'hud-purple'
}

export function HudToggle({ value, onChange, label, disabled, icon, color }: HudToggleProps) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      {label && (
        <span className="hud-label text-hud-muted select-none">{label}</span>
      )}
      {icon && (
        <span className="text-hud-muted">{icon}</span>
      )}
      <button
        type="button"
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        aria-pressed={value}
        className={`relative w-10 h-5 border transition-all duration-200 shrink-0 disabled:opacity-40 disabled:pointer-events-none ${
          value
            ? `border-${color} bg-${color}/20 shadow-[0_0_8px_rgba(${color}-rgb,0.3)]`
            : 'border-hud-border bg-hud-deep'
        }`}
      >
        <span
          className={`absolute top-0.5 h-3.5 w-3.5 border transition-all duration-200 ${
            value
              ? `left-[calc(100%-16px)] border-${color} bg-${color}`
              : 'left-0.5 border-hud-muted bg-hud-muted'
          }`}
        />
      </button>
    </div>
  )
}
