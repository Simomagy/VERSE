import type { LucideIcon } from 'lucide-react'

interface EmptyStateCardProps {
  icon: LucideIcon
  title: string
  description: string
  accentColor: string
  action?: {
    label: string
    onClick: (e: React.MouseEvent) => void
  }
}

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  accentColor,
  action
}: EmptyStateCardProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-5 h-full text-center">
      <div
        className="p-3 border"
        style={{
          borderColor: `${accentColor}30`,
          backgroundColor: `${accentColor}08`
        }}
      >
        <Icon className="h-5 w-5 opacity-35" style={{ color: accentColor }} />
      </div>

      <div className="space-y-1">
        <p className="font-mono text-xs text-hud-text">{title}</p>
        <p
          className="hud-label text-hud-dim leading-relaxed max-w-[180px]"
          style={{ fontSize: '10px' }}
        >
          {description}
        </p>
      </div>

      {action && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            action.onClick(e)
          }}
          className="hud-label uppercase px-3 py-1.5 border transition-colors hover:bg-opacity-10"
          style={{
            borderColor: `${accentColor}50`,
            color: accentColor
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
