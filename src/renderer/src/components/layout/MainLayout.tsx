import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { PAGE_VARIANTS } from '../../lib/animations'
import { TitleBar } from './TitleBar'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { StatusBar } from './StatusBar'

export function MainLayout() {
  const location = useLocation()

  return (
    <div className="flex flex-col h-full w-full bg-hud-deep overflow-hidden">
      {/* Barra titolo custom — sostituisce il frame nativo di Electron */}
      <TitleBar />

      {/* Corpo: sidebar | contenuto */}
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
