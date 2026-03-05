import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { PAGE_VARIANTS } from '../../lib/animations'
import { TitleBar } from './TitleBar'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { StatusBar } from './StatusBar'
import { useUIStore } from '../../stores/ui.store'
import { cn } from '../../lib/utils'

const OVERLAY_NAV_ROUTES = [
  '/home',
  '/fleet',
  '/trades',
  '/refinery',
  '/wallet',
  '/equipment',
  '/commodities',
  '/settings'
]

const INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

export function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isOverlayMode = useUIStore((state) => state.isOverlayMode)

  useEffect(() => {
    if (!isOverlayMode) return

    function handleTabNav(e: KeyboardEvent): void {
      if (e.key !== 'Tab') return
      const target = e.target as HTMLElement
      if (INPUT_TAGS.has(target.tagName)) return

      e.preventDefault()

      const current = OVERLAY_NAV_ROUTES.indexOf(location.pathname)
      const base = current === -1 ? 0 : current
      const next = e.shiftKey
        ? (base - 1 + OVERLAY_NAV_ROUTES.length) % OVERLAY_NAV_ROUTES.length
        : (base + 1) % OVERLAY_NAV_ROUTES.length

      navigate(OVERLAY_NAV_ROUTES[next])
    }

    window.addEventListener('keydown', handleTabNav)
    return () => window.removeEventListener('keydown', handleTabNav)
  }, [isOverlayMode, location.pathname, navigate])

  return (
    <div
      className={cn(
        'flex flex-col h-full w-full overflow-hidden',
        isOverlayMode ? 'bg-transparent' : 'bg-hud-deep'
      )}
    >
      {!isOverlayMode && <TitleBar />}

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar />

        <div className="flex flex-col flex-1 min-w-0 h-full">
          <TopBar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hud min-h-0 relative">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                variants={PAGE_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
          <StatusBar />
        </div>
      </div>
    </div>
  )
}
