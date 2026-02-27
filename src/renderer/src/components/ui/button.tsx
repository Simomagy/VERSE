import * as React from 'react'
import { cn } from '@renderer/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'hud' | 'hud-ghost' | 'hud-amber' | 'hud-danger'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants: Record<string, string> = {
      default:
        'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive:
        'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline:
        'border border-hud-border bg-transparent text-hud-text hover:border-hud-border-glow hover:bg-hud-card',
      secondary:
        'bg-hud-card text-hud-text hover:bg-hud-panel hover:border-hud-border-glow border border-hud-border',
      ghost:
        'bg-transparent text-hud-muted hover:bg-hud-card hover:text-hud-text',
      link:
        'text-hud-cyan underline-offset-4 hover:underline bg-transparent',
      hud:
        'relative bg-transparent border border-hud-cyan text-hud-cyan font-mono text-xs tracking-widest uppercase ' +
        'hover:bg-hud-cyan/10 hover:shadow-[0_0_12px_rgba(0,229,255,0.35)] ' +
        'active:bg-hud-cyan/20 transition-all duration-150',
      'hud-ghost':
        'bg-transparent border border-hud-border text-hud-muted font-mono text-xs tracking-wider uppercase ' +
        'hover:border-hud-border-glow hover:text-hud-text transition-all duration-150',
      'hud-amber':
        'bg-transparent border border-hud-amber text-hud-amber font-mono text-xs tracking-widest uppercase ' +
        'hover:bg-hud-amber/10 hover:shadow-[0_0_12px_rgba(232,160,32,0.35)] ' +
        'active:bg-hud-amber/20 transition-all duration-150',
      'hud-danger':
        'bg-transparent border border-hud-red text-hud-red font-mono text-xs tracking-widest uppercase ' +
        'hover:bg-hud-red/10 hover:shadow-[0_0_12px_rgba(255,60,60,0.35)] ' +
        'active:bg-hud-red/20 transition-all duration-150',
    }

    const sizes: Record<string, string> = {
      default: 'h-9 px-4 py-2',
      sm: 'h-7 px-3 text-xs',
      lg: 'h-11 px-8',
      icon: 'h-8 w-8'
    }

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ' +
          'transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-hud-cyan ' +
          'disabled:pointer-events-none disabled:opacity-40',
          variants[variant] ?? variants.default,
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
