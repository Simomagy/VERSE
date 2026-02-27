import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'

const API_CHECK_INTERVAL_MS = 60_000  // ri-ping ogni 60 s

type ApiStatus = 'checking' | 'online' | 'offline'

function useClock() {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

function useAppInfo() {
  const [version, setVersion]   = useState<string>('…')
  const [apiStatus, setApiStatus] = useState<{ uex: ApiStatus; wiki: ApiStatus }>({
    uex:  'checking',
    wiki: 'checking'
  })

  useEffect(() => {
    if (typeof window.api?.app?.version === 'function') {
      window.api.app.version().then(setVersion).catch(() => setVersion('?'))
    }
  }, [])

  useEffect(() => {
    const check = () => {
      if (typeof window.api?.app?.checkApis !== 'function') return
      setApiStatus({ uex: 'checking', wiki: 'checking' })
      window.api.app.checkApis()
        .then(({ uex, wiki }) =>
          setApiStatus({
            uex:  uex  ? 'online' : 'offline',
            wiki: wiki ? 'online' : 'offline'
          })
        )
        .catch(() => setApiStatus({ uex: 'offline', wiki: 'offline' }))
    }

    check()
    const id = setInterval(check, API_CHECK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return { version, apiStatus }
}

function useUpdater() {
  const [updateReady, setUpdateReady] = useState<{ version: string } | null>(null)

  useEffect(() => {
    if (typeof window.api?.updater?.onUpdateDownloaded !== 'function') return
    window.api.updater.onUpdateDownloaded((info) => setUpdateReady(info))
  }, [])

  const install = () => {
    if (typeof window.api?.updater?.install === 'function') {
      window.api.updater.install()
    }
  }

  return { updateReady, install }
}

function ApiDot({ label, status }: { label: string; status: ApiStatus }) {
  const cfg: Record<ApiStatus, { color: string; glow: string; text: string; pulse: boolean }> = {
    checking: { color: 'bg-hud-amber',  glow: '0 0 4px #e8a020', text: 'text-hud-amber',  pulse: true  },
    online:   { color: 'bg-hud-green',  glow: '0 0 4px #00e87a', text: 'text-hud-green',  pulse: false },
    offline:  { color: 'bg-hud-red',    glow: '0 0 4px #ff4040', text: 'text-hud-red',    pulse: false }
  }
  const c = cfg[status]
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`w-1.5 h-1.5 ${c.color} ${c.pulse ? 'animate-pulse' : ''}`}
        style={{ boxShadow: c.glow }}
      />
      <span className={`hud-label ${c.text}`}>{label}</span>
    </div>
  )
}

export function StatusBar() {
  const now = useClock()
  const { version, apiStatus } = useAppInfo()
  const { updateReady, install } = useUpdater()

  const hh = now.getHours().toString().padStart(2, '0')
  const mm = now.getMinutes().toString().padStart(2, '0')
  const ss = now.getSeconds().toString().padStart(2, '0')

  return (
    <footer className="flex h-7 shrink-0 items-center border-t border-hud-border bg-hud-deep px-4">
      {/* Sinistra: branding + versione */}
      <div className="flex items-center gap-3 flex-1">
        <span className="hud-label text-hud-muted">V.E.R.S.E.</span>
        <span className="hud-label text-hud-dim">·</span>
        <span className="hud-label text-hud-dim">PRYSMA STUDIO</span>
        <span className="hud-label text-hud-dim">·</span>
        <span className="hud-label text-hud-dim">BUILD {version}</span>
      </div>

      {/* Centro: indicatori API + badge aggiornamento */}
      <div className="flex items-center gap-4">
        <ApiDot label="UEX API"  status={apiStatus.uex}  />
        <ApiDot label="SC WIKI"  status={apiStatus.wiki} />

        {updateReady && (
          <button
            onClick={install}
            title={`v${updateReady.version} scaricato — clicca per installare e riavviare`}
            className="flex items-center gap-1.5 px-2 py-0.5 border border-hud-green/60
              bg-hud-green/10 text-hud-green hud-label animate-pulse
              hover:bg-hud-green/20 hover:border-hud-green transition-colors"
          >
            <Download className="h-2.5 w-2.5" />
            v{updateReady.version} READY
          </button>
        )}
      </div>

      {/* Destra: orologio */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        <span className="hud-label text-hud-dim">STARTIME</span>
        <span
          className="font-mono text-[11px] font-bold text-hud-cyan tracking-widest"
          style={{ textShadow: '0 0 6px rgba(0,229,255,0.5)' }}
        >
          {hh}:{mm}:{ss}
        </span>
      </div>
    </footer>
  )
}
