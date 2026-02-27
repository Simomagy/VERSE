import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStaticDataStore, type DatasetStatus } from '../../stores/static-data.store'

// ── Varianti locali ────────────────────────────────────────────────────────

const logoVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: [0, 0.6, 0.2, 0.9, 0.5, 1] as number[],
    transition: { duration: 0.6, times: [0, 0.1, 0.25, 0.5, 0.75, 1] }
  }
}

const containerVariants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.5 } }
}

const rowVariants = {
  initial: { opacity: 0, x: -10 },
  animate: {
    opacity: [0, 0.5, 0.3, 0.8, 0.6, 1] as number[],
    x: 0,
    transition: {
      opacity: { duration: 0.3, times: [0, 0.1, 0.22, 0.5, 0.72, 1] },
      x:       { duration: 0.2, ease: 'easeOut' as const }
    }
  }
}

const statusVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, delay: 0.2 } }
}

// ── Dataset row ────────────────────────────────────────────────────────────

interface DatasetRowProps {
  label: string
  status: DatasetStatus
  count?: number
}

function DatasetRow({ label, status, count }: DatasetRowProps) {
  const statusConfig: Record<DatasetStatus, { icon: string; color: string; text: string }> = {
    idle:    { icon: '○', color: 'text-hud-muted',  text: 'standby'    },
    loading: { icon: '◎', color: 'text-hud-cyan',   text: 'loading...' },
    done:    { icon: '◆', color: 'text-hud-green',  text: count !== undefined ? `${count} records` : 'done' },
    error:   { icon: '✕', color: 'text-hud-red',    text: 'failed'     }
  }

  const cfg = statusConfig[status]

  return (
    <motion.div
      variants={rowVariants}
      className="flex items-center gap-3 font-mono text-xs tracking-widest"
    >
      <span className={`w-3 text-center ${cfg.color} ${status === 'loading' ? 'animate-pulse' : ''}`}>
        {cfg.icon}
      </span>
      <span className="text-hud-muted w-24 uppercase">{label}</span>
      <span className={cfg.color}>{cfg.text}</span>
    </motion.div>
  )
}

// ── BootScreen ────────────────────────────────────────────────────────────

export function BootScreen() {
  const {
    status, progress, error, load,
    ships, systems, celestialObjects, commodities, spaceStations, cities, outposts
  } = useStaticDataStore()

  useEffect(() => { load() }, [])

  return (
    <div className="flex h-screen w-screen bg-hud-deep items-center justify-center overflow-hidden relative">
      {/* Scanline overlay */}
      <div className="absolute inset-0 hud-scanline pointer-events-none opacity-30" />

      {/* Angoli decorativi */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-hud-cyan opacity-60" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-hud-cyan opacity-60" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-hud-cyan opacity-60" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-hud-cyan opacity-60" />

      <div className="flex flex-col items-center gap-8 w-80">

        {/* Logo con flicker HUD */}
        <motion.div
          className="text-center"
          variants={logoVariants}
          initial="initial"
          animate="animate"
        >
          <h1 className="font-mono text-5xl font-bold tracking-[0.3em] hud-text-cyan mb-1">
            VERSE
          </h1>
          <p className="font-mono text-[10px] tracking-[0.25em] text-hud-muted uppercase">
            UEX Corp Companion
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="w-full h-px bg-hud-border relative"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
          style={{ originX: 0 }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 -top-[5px] w-2 h-2 bg-hud-cyan rotate-45" />
        </motion.div>

        {/* Dataset status list — stagger */}
        <motion.div
          className="w-full flex flex-col gap-2.5 px-2"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <p className="font-mono text-[9px] tracking-[0.3em] text-hud-muted uppercase mb-1">
            Initializing systems
          </p>
          <DatasetRow label="Vessels"     status={progress.ships}       count={ships.length || undefined} />
          <DatasetRow label="Systems"     status={progress.systems}     count={systems.length || undefined} />
          <DatasetRow label="Locations"   status={progress.locations}   count={celestialObjects.length || undefined} />
          <DatasetRow label="Commodities" status={progress.commodities} count={commodities.length || undefined} />
          <DatasetRow label="Stations"    status={progress.stations}    count={spaceStations.length || undefined} />
          <DatasetRow label="Cities"      status={progress.cities}      count={cities.length || undefined} />
          <DatasetRow label="Outposts"    status={progress.outposts}    count={outposts.length || undefined} />
        </motion.div>

        {/* Divider */}
        <motion.div
          className="w-full h-px bg-hud-border"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.3 }}
        />

        {/* Stato globale */}
        <motion.div
          className="font-mono text-[10px] tracking-widest text-center"
          variants={statusVariants}
          initial="initial"
          animate="animate"
        >
          {status === 'loading' && (
            <span className="text-hud-cyan animate-pulse uppercase">
              Syncing with network...
            </span>
          )}
          {status === 'ready' && (
            <span className="text-hud-green uppercase">
              All systems nominal — launching
            </span>
          )}
          {status === 'error' && (
            <div className="flex flex-col gap-1 items-center">
              <span className="text-hud-red uppercase">Partial initialization failure</span>
              {error && (
                <span className="text-hud-muted text-[9px] max-w-xs text-center break-words">
                  {error}
                </span>
              )}
              <span className="text-hud-amber mt-1">App will launch with available data</span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
