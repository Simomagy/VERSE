import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, CheckCircle, AlertTriangle, X } from 'lucide-react'

type UpdateState =
  | { phase: 'idle' }
  | { phase: 'available'; version: string }
  | { phase: 'downloading'; version: string; percent: number; bytesPerSecond: number }
  | { phase: 'ready'; version: string }
  | { phase: 'error'; message: string }

function formatSpeed(bps: number): string {
  if (bps > 1_000_000) return `${(bps / 1_000_000).toFixed(1)} MB/s`
  if (bps > 1_000) return `${(bps / 1_000).toFixed(0)} KB/s`
  return `${bps} B/s`
}

export function UpdateBanner() {
  const [state, setState] = useState<UpdateState>({ phase: 'idle' })
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    window.api.updater.onUpdateAvailable((info) => {
      setState({ phase: 'available', version: info.version })
      setDismissed(false)
    })

    window.api.updater.onDownloadProgress((progress) => {
      setState((prev) => ({
        phase: 'downloading',
        version: prev.phase === 'available' || prev.phase === 'downloading' ? (prev as { version: string }).version : '?',
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond
      }))
    })

    window.api.updater.onUpdateDownloaded((info) => {
      setState({ phase: 'ready', version: info.version })
      setDismissed(false)
    })

    window.api.updater.onError((info) => {
      // In dev mode l'errore è atteso — mostrarlo solo in produzione
      if (import.meta.env.PROD) {
        setState({ phase: 'error', message: info.message })
      }
    })
  }, [])

  const visible = !dismissed && state.phase !== 'idle'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-4 right-4 z-[9998] w-80 border border-hud-border bg-hud-panel font-mono shadow-2xl"
        >
          {state.phase === 'available' && (
            <BannerAvailable version={state.version} onDismiss={() => setDismissed(true)} />
          )}
          {state.phase === 'downloading' && (
            <BannerDownloading
              version={state.version}
              percent={state.percent}
              speed={state.bytesPerSecond}
            />
          )}
          {state.phase === 'ready' && (
            <BannerReady version={state.version} onDismiss={() => setDismissed(true)} />
          )}
          {state.phase === 'error' && (
            <BannerError message={state.message} onDismiss={() => setDismissed(true)} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Sub-panels ───────────────────────────────────────────────────────────

function BannerAvailable({ version, onDismiss }: { version: string; onDismiss: () => void }) {
  return (
    <div className="p-3 space-y-2">
      <BannerHeader icon={<Download className="h-3.5 w-3.5 text-hud-cyan" />} label="UPDATE AVAILABLE" onDismiss={onDismiss} />
      <p className="hud-label text-hud-muted">
        Version <span className="text-hud-text">{version}</span> is downloading in background.
      </p>
    </div>
  )
}

function BannerDownloading({ version, percent, speed }: { version: string; percent: number; speed: number }) {
  const pct = Math.min(100, Math.round(percent))
  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Download className="h-3.5 w-3.5 text-hud-cyan animate-bounce shrink-0" />
        <span className="hud-label text-hud-cyan tracking-widest">DOWNLOADING v{version}</span>
        <span className="hud-label text-hud-muted ml-auto">{formatSpeed(speed)}</span>
      </div>
      <div className="h-1 bg-hud-border w-full">
        <motion.div
          className="h-full bg-hud-cyan"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="hud-label text-hud-muted text-right">{pct}%</p>
    </div>
  )
}

function BannerReady({ version, onDismiss }: { version: string; onDismiss: () => void }) {
  return (
    <div className="p-3 space-y-3">
      <BannerHeader icon={<CheckCircle className="h-3.5 w-3.5 text-hud-green" />} label="UPDATE READY" onDismiss={onDismiss} />
      <p className="hud-label text-hud-muted">
        v<span className="text-hud-text">{version}</span> ready. Restart to apply.
      </p>
      <button
        onClick={() => window.api.updater.install()}
        className="w-full h-8 border border-hud-green text-hud-green hud-label tracking-widest
          hover:bg-hud-green/10 transition-colors"
      >
        RESTART & INSTALL
      </button>
    </div>
  )
}

function BannerError({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="p-3 space-y-2">
      <BannerHeader icon={<AlertTriangle className="h-3.5 w-3.5 text-hud-amber" />} label="UPDATE ERROR" onDismiss={onDismiss} />
      <p className="hud-label text-hud-dim break-words leading-relaxed">{message}</p>
    </div>
  )
}

function BannerHeader({
  icon,
  label,
  onDismiss
}: {
  icon: React.ReactNode
  label: string
  onDismiss: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="hud-label tracking-widest text-hud-text">{label}</span>
      <button onClick={onDismiss} className="ml-auto text-hud-dim hover:text-hud-muted transition-colors p-0.5">
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}
