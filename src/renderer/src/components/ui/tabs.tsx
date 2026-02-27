import * as React from 'react'
import { cn } from '@renderer/lib/utils'

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
    onValueChange: (value: string) => void
  }
>(({ className, value, onValueChange, ...props }, ref) => (
  <TabsContext.Provider value={{ value, onValueChange }}>
    <div ref={ref} className={cn('w-full', className)} {...props} />
  </TabsContext.Provider>
))
Tabs.displayName = 'Tabs'

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('inline-flex items-center border-b border-hud-border gap-0', className)}
      {...props}
    />
  )
)
TabsList.displayName = 'TabsList'

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')

  const isActive = context.value === value

  return (
    <button
      ref={ref}
      className={cn(
        'relative px-5 py-2 hud-label transition-colors duration-150 ' +
          'focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40',
        isActive
          ? 'text-hud-cyan border-b-2 border-hud-cyan -mb-px'
          : 'text-hud-muted hover:text-hud-text border-b-2 border-transparent -mb-px',
        className
      )}
      onClick={() => context.onValueChange(value)}
      {...props}
    />
  )
})
TabsTrigger.displayName = 'TabsTrigger'

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')

  if (context.value !== value) return null

  return <div ref={ref} className={cn('focus-visible:outline-none', className)} {...props} />
})
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }
