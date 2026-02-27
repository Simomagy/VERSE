import { useEffect, useState } from 'react'
import { Minus, Square, X, Maximize2 } from 'lucide-react'
import { cn } from '@renderer/lib/utils'

export function TitleBar() {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    if (typeof window.api.window.isMaximized === 'function') {
      window.api.window.isMaximized().then(setMaximized)
    }
  }, [])

  const handleMinimize = () => window.api.window.minimize()

  const handleMaximize = () => {
    window.api.window.maximize()
    setMaximized((prev) => !prev)
  }

  const handleClose = () => window.api.window.close()

  return (
    <div
      className="drag-region flex h-8 w-full shrink-0 items-center
        bg-hud-deep border-b border-hud-border/60 select-none relative"
    >
      {/* Angolino decorativo */}
      <span className="absolute bottom-0 left-0 w-12 h-px bg-hud-cyan/20" />

      {/* Left: brand */}
      <div className="flex items-center gap-2.5 px-3 shrink-0">
        <span className="w-1.5 h-1.5 bg-hud-cyan"
          style={{ boxShadow: '0 0 5px rgba(0,229,255,0.8)' }} />
        <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-hud-cyan/80">
          V.E.R.S.E.
        </span>
        <span className="font-mono text-[9px] tracking-widest text-hud-muted/60 uppercase">
          — By Prysma Studio
        </span>
      </div>

      {/* Center: drag zone, invisible but fills space */}
      <div className="flex-1" />

      {/* Right: system clock + window controls */}
      <div className="no-drag-region flex items-center shrink-0">
        {/* Timestamp real-time */}
        <Clock />

        {/* Separatore */}
        <div className="h-3 w-px bg-hud-border mx-2" />

        {/* Window controls */}
        <div className="flex items-stretch h-8">
          <TitleBtn
            onClick={handleMinimize}
            title="Minimize"
            hoverClass="hover:bg-hud-amber/10 hover:text-hud-amber"
          >
            <Minus className="h-3 w-3" />
          </TitleBtn>

          <TitleBtn
            onClick={handleMaximize}
            title={maximized ? 'Restore' : 'Maximize'}
            hoverClass="hover:bg-hud-blue/10 hover:text-hud-blue"
          >
            {maximized
              ? <Square className="h-3 w-3" />
              : <Maximize2 className="h-3 w-3" />
            }
          </TitleBtn>

          <TitleBtn
            onClick={handleClose}
            title="Close"
            hoverClass="hover:bg-hud-red/20 hover:text-hud-red"
            className="border-r-0"
          >
            <X className="h-3 w-3" />
          </TitleBtn>
        </div>
      </div>
    </div>
  )
}

function TitleBtn({
  onClick, title, hoverClass, className, children
}: {
  onClick: () => void
  title: string
  hoverClass: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'flex h-full w-10 items-center justify-center',
        'text-hud-muted/50 border-l border-hud-border/40',
        'transition-all duration-100',
        hoverClass,
        className
      )}
    >
      {children}
    </button>
  )
}

function Clock() {
  const [time, setTime] = useState(() => formatTime(new Date()))

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(new Date())), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="font-mono text-[9px] tracking-widest text-hud-muted/50 pr-1">
      {time}
    </span>
  )
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
