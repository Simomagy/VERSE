import * as React from 'react'
import { cn } from '@renderer/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full border border-hud-border bg-hud-deep px-3 py-2 ' +
            'text-sm text-hud-text font-mono ' +
            'placeholder:text-hud-dim ' +
            'focus-visible:outline-none focus-visible:border-hud-cyan ' +
            'focus-visible:shadow-[0_0_0_1px_rgba(0,229,255,0.2)] ' +
            'disabled:cursor-not-allowed disabled:opacity-40 ' +
            'transition-[border-color,box-shadow] duration-150 ' +
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
