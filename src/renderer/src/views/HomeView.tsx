import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FleetWidget } from '../components/home/FleetWidget'
import { TradesWidget } from '../components/home/TradesWidget'
import { RefineryWidget } from '../components/home/RefineryWidget'
import { WalletWidget } from '../components/home/WalletWidget'
import { CommoditiesWidget } from '../components/home/CommoditiesWidget'
import { StatsWidget } from '../components/home/StatsWidget'

// ── Animation variants ─────────────────────────────────────────────────────

const GRID_VARIANTS = {
  initial: {},
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
}

const WIDGET_VARIANTS = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: [0, 0.5, 0.2, 0.85, 0.6, 1] as number[],
    y: 0,
    transition: {
      opacity: { duration: 0.35, times: [0, 0.08, 0.2, 0.5, 0.72, 1] },
      y: { duration: 0.22, ease: 'easeOut' as const }
    }
  }
}

// ── Bento layout — 5 columns, 5 rows ─────────────────────────────────────
//
//  Col proportions: 2fr | 1fr | 3fr | 2fr | 2fr  (totale 10fr)
//
//  Row 1 (96px)  : [  stats 3fr   ] [         trades  7fr            ]
//  Row 2 (96px)  : [fleet][wallet ] [         trades  7fr            ]
//  Row 3 (1fr)   : [  commodities 6fr       ] [  refinery  4fr  ]
//  Row 4 (1fr)   : [  commodities 6fr       ] [  refinery  4fr  ]
//  Row 5 (1fr)   : [  commodities 6fr       ] [  refinery  4fr  ]
//
//  Asimmetria verticale: trades (righe 1-2) inizia al 30% orizzontale
//  Asimmetria orizzontale: commodities (60%) > refinery (40%)

const BENTO_AREAS = `
  "stats  stats  trades trades trades"
  "fleet  wallet trades trades trades"
  "comm   comm   comm   refine refine"
  "comm   comm   comm   refine refine"
  "comm   comm   comm   refine refine"
`

// ── Main View ──────────────────────────────────────────────────────────────

export function HomeView() {
  const { t } = useTranslation()

  const [addShipOpen, setAddShipOpen] = useState(false)
  const [logTradeOpen, setLogTradeOpen] = useState(false)
  const [logJobOpen, setLogJobOpen] = useState(false)
  const [addWalletOpen, setAddWalletOpen] = useState(false)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-hud-border shrink-0">
        <span className="font-mono text-xs font-bold tracking-[0.25em] text-hud-cyan">
          {t('home.title')}
        </span>
        <span className="h-px w-8 bg-hud-border" />
        <span className="hud-label text-hud-dim" style={{ fontSize: '9px' }}>
          {t('home.subtitle')}
        </span>
      </div>

      {/* Grid wrapper — occupa tutto lo spazio rimanente, contiene il grid in assoluto */}
      <div className="flex-1 min-h-0 relative">
        <motion.div
          className="absolute inset-0 p-3"
          style={{
            display: 'grid',
            gap: '10px',
            gridTemplateColumns: '2fr 1fr 3fr 2fr 2fr',
            gridTemplateRows: '90px 90px 1fr 1fr 1fr',
            gridTemplateAreas: BENTO_AREAS
          }}
          variants={GRID_VARIANTS}
          initial="initial"
          animate="animate"
        >
          <WidgetSlot area="stats">
            <StatsWidget />
          </WidgetSlot>

          <WidgetSlot area="fleet">
            <FleetWidget onAddShip={() => setAddShipOpen(true)} />
          </WidgetSlot>

          <WidgetSlot area="wallet">
            <WalletWidget onAddEntry={() => setAddWalletOpen(true)} />
          </WidgetSlot>

          <WidgetSlot area="trades">
            <TradesWidget onLogTrade={() => setLogTradeOpen(true)} />
          </WidgetSlot>

          <WidgetSlot area="comm">
            <CommoditiesWidget />
          </WidgetSlot>

          <WidgetSlot area="refine">
            <RefineryWidget onLogJob={() => setLogJobOpen(true)} />
          </WidgetSlot>
        </motion.div>
      </div>

      {addShipOpen && <AddShipModal onClose={() => setAddShipOpen(false)} />}
      {logTradeOpen && <LogTradeModal onClose={() => setLogTradeOpen(false)} />}
      {logJobOpen && <LogJobModal onClose={() => setLogJobOpen(false)} />}
      {addWalletOpen && <AddWalletModal onClose={() => setAddWalletOpen(false)} />}
    </div>
  )
}

// ── Widget slot wrapper ────────────────────────────────────────────────────

// Il grid assegna al slot dimensioni esplicite (larghezza × altezza).
// Il motion.div eredita quell'altezza e la passa al figlio via h-full.
function WidgetSlot({ children, area }: { children: React.ReactNode; area: string }) {
  return (
    <motion.div
      style={{ gridArea: area, overflow: 'hidden' }}
      variants={WIDGET_VARIANTS}
    >
      <div style={{ height: '100%' }}>{children}</div>
    </motion.div>
  )
}

// ── Modal stubs — redirect to dedicated pages for full functionality ────────
// These minimal modals open the corresponding view's modal inline.
// They use the same IPC-backed hooks as the full views.

function AddShipModal({ onClose }: { onClose: () => void }) {
  return <QuickActionRedirectModal sectionKey="home.modal.section.fleet" targetPath="/fleet" onClose={onClose} />
}

function LogTradeModal({ onClose }: { onClose: () => void }) {
  return <QuickActionRedirectModal sectionKey="home.modal.section.trades" targetPath="/trades" onClose={onClose} />
}

function LogJobModal({ onClose }: { onClose: () => void }) {
  return <QuickActionRedirectModal sectionKey="home.modal.section.refinery" targetPath="/refinery" onClose={onClose} />
}

function AddWalletModal({ onClose }: { onClose: () => void }) {
  return <QuickActionRedirectModal sectionKey="home.modal.section.wallet" targetPath="/wallet" onClose={onClose} />
}

function QuickActionRedirectModal({
  sectionKey,
  targetPath,
  onClose
}: {
  sectionKey: string
  targetPath: string
  onClose: () => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const section = t(sectionKey)

  const handleGo = () => {
    onClose()
    navigate(targetPath)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="hud-panel p-6 max-w-xs w-full mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-mono text-sm text-hud-text mb-1">
          {t('home.modal.openTitle', { section })}
        </p>
        <p className="hud-label text-hud-dim mb-5" style={{ fontSize: '10px' }}>
          {t('home.modal.openBody', { section })}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-1.5 hud-label text-hud-muted border border-hud-border hover:text-hud-text transition-colors"
          >
            {t('home.modal.cancel')}
          </button>
          <button
            onClick={handleGo}
            className="flex-1 py-1.5 hud-label text-hud-cyan border border-hud-cyan/40 hover:bg-hud-cyan/5 transition-colors"
          >
            {t('home.modal.goTo', { section: section.toUpperCase() })}
          </button>
        </div>
      </div>
    </div>
  )
}
