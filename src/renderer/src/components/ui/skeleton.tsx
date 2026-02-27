import { cn } from '@renderer/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse bg-hud-panel border border-hud-border',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
