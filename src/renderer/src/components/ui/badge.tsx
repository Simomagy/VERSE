import * as React from 'react'
import { cn } from '@renderer/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'cyan' | 'amber' | 'green' | 'red'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    default:
      'border border-hud-cyan/40 bg-hud-cyan/10 text-hud-cyan',
    secondary:
      'border border-hud-border bg-hud-card text-hud-muted',
    destructive:
      'border border-hud-red/40 bg-hud-red/10 text-hud-red',
    outline:
      'border border-hud-border bg-transparent text-hud-muted',
    success:
      'border border-hud-green/40 bg-hud-green/10 text-hud-green',
    cyan:
      'border border-hud-cyan/40 bg-hud-cyan/10 text-hud-cyan',
    amber:
      'border border-hud-amber/40 bg-hud-amber/10 text-hud-amber',
    green:
      'border border-hud-green/40 bg-hud-green/10 text-hud-green',
    red:
      'border border-hud-red/40 bg-hud-red/10 text-hud-red',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center px-2 py-0.5 font-mono text-[10px] font-medium ' +
        'tracking-widest uppercase transition-colors',
        variants[variant] ?? variants.default,
        className
      )}
      {...props}
    />
  )
}

export { Badge }
