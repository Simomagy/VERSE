import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'
import type { LucideIcon } from 'lucide-react'

interface QuickAction {
  label: string
  icon: LucideIcon
  onClick: () => void
}

interface WidgetCardProps {
  title: string
  icon: LucideIcon
  accentColor: string
  navigateTo?: string
  quickAction?: QuickAction
  className?: string
  children: React.ReactNode
}

export function WidgetCard({
  title,
  icon: Icon,
  accentColor,
  navigateTo,
  quickAction,
  className,
  children
}: WidgetCardProps) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  const handleCardClick = () => {
    if (navigateTo) navigate(navigateTo)
  }

  const isInteractive = !!navigateTo

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden bg-hud-panel relative h-full',
        'border',
        isInteractive && 'cursor-pointer',
        className
      )}
      style={{
        borderColor: hovered && isInteractive ? `${accentColor}55` : `${accentColor}30`,
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)',
        filter:
          hovered && isInteractive ? `drop-shadow(0 0 12px ${accentColor}28)` : 'none',
        transition: 'border-color 0.2s ease, filter 0.25s ease'
      }}
      onClick={handleCardClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Accent top bar — più spessa e piena */}
      <div
        className="h-[2px] w-full shrink-0"
        style={{
          backgroundColor: accentColor,
          opacity: hovered && isInteractive ? 1 : 0.7,
          transition: 'opacity 0.2s ease'
        }}
      />

      {/* Corner decoration bottom-right */}
      <span
        className="absolute bottom-3 right-0 w-3 h-px"
        style={{ backgroundColor: `${accentColor}50` }}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-hud-border/60 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Icon
            className="h-3.5 w-3.5 shrink-0 transition-opacity duration-200"
            style={{ color: accentColor, opacity: hovered && isInteractive ? 1 : 0.75 }}
          />
          <span className="hud-label text-hud-muted tracking-widest">{title}</span>
        </div>

        {quickAction && (
          <button
            title={quickAction.label}
            onClick={(e) => {
              e.stopPropagation()
              quickAction.onClick()
            }}
            className="flex items-center gap-0.5 p-0.5 text-hud-dim hover:text-hud-text transition-colors shrink-0 ml-2"
          >
            <span className="font-mono" style={{ fontSize: '7px', lineHeight: '7px' }}>{quickAction.label}</span>
            <quickAction.icon className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
    </div>
  )
}
