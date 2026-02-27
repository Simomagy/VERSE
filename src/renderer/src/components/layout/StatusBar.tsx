import { useState, useEffect } from 'react'

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

      {/* Centro: indicatori API reali */}
      <div className="flex items-center gap-4">
        <ApiDot label="UEX API"  status={apiStatus.uex}  />
        <ApiDot label="SC WIKI"  status={apiStatus.wiki} />
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
