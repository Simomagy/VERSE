import { useLocation, useNavigate } from 'react-router-dom'
import { useWalletBalance } from '../../hooks/useWallet'
import { formatUEC } from '../../lib/utils'

interface ViewMeta {
  label: string
  accent: string
  accentDim: string
}

const VIEW_META: Record<string, ViewMeta> = {
  '/fleet':    { label: 'FLEET REGISTRY',  accent: '#4080ff', accentDim: 'rgba(64,128,255,0.12)'  },
  '/trades':   { label: 'TRADE LOG',       accent: '#e8a020', accentDim: 'rgba(232,160,32,0.12)'  },
  '/refinery': { label: 'REFINERY LOG',    accent: '#a060ff', accentDim: 'rgba(160,96,255,0.12)'  },
  '/wallet':   { label: 'WALLET',          accent: '#00e87a', accentDim: 'rgba(0,232,122,0.12)'  },
  '/settings': { label: 'SYSTEM CONFIG',   accent: '#808080', accentDim: 'rgba(128,128,128,0.12)' },
}

export function TopBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const balance = useWalletBalance()
  const meta = VIEW_META[pathname] ?? VIEW_META['/fleet']
  const isWallet = pathname === '/wallet'

  return (
    <header
      className="flex h-12 shrink-0 items-center border-b border-hud-border px-4 gap-4"
      style={{ background: `linear-gradient(90deg, ${meta.accentDim} 0%, #000000 40%)` }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-mono text-sm font-black tracking-tighter text-hud-cyan
          drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]">
          V.E.R.S.E.
        </span>
      </div>

      {/* Separatore */}
      <span className="font-mono text-hud-border-glow text-sm select-none">›</span>

      {/* View label con accento colorato */}
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[10px] select-none" style={{ color: meta.accent }}>[</span>
        <span className="hud-label tracking-[0.15em]" style={{ color: meta.accent }}>
          {meta.label}
        </span>
        <span className="font-mono text-[10px] select-none" style={{ color: meta.accent }}>]</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Status bar destra */}
      <div className="flex items-center gap-4">
        {/* Accento sezione - disabled */}
        {/* <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-none"
            style={{ background: meta.accent, boxShadow: `0 0 6px ${meta.accent}` }}
          />
          <span className="hud-label" style={{ color: meta.accent }}>ACTIVE</span>
        </div> */}

        {/* Separatore - disabled */}
        {/* <div className="h-4 w-px bg-hud-border" /> */}

        {/* Balance — cliccabile → /wallet */}
        {!isWallet && (
          <button
            onClick={() => navigate('/wallet')}
            title="Go to Wallet"
            className={[
              'group flex items-center gap-2 px-2.5 py-1',
              'border transition-all duration-150',
              balance >= 0
                ? 'border-hud-green/30 hover:border-hud-green/60 hover:bg-hud-green/5'
                : 'border-hud-red/30  hover:border-hud-red/60  hover:bg-hud-red/5',
            ].join(' ')}
          >
            <span className="hud-label text-hud-dim group-hover:text-hud-muted transition-colors">BAL</span>
            <span className={[
              'font-mono text-xs font-bold tabular-nums transition-colors',
              balance >= 0
                ? 'text-hud-green drop-shadow-[0_0_6px_rgba(0,232,122,0.5)]'
                : 'text-hud-red   drop-shadow-[0_0_6px_rgba(255,64,64,0.5)]'
            ].join(' ')}>
              {balance >= 0 ? '+' : ''}{formatUEC(balance)}
            </span>
          </button>
        )}

        {/* Separatore */}
        <div className="h-4 w-px bg-hud-border" />

        {/* Online status */}
        <div className="flex items-center gap-1.5">
          <span className="status-pulse status-pulse-green" />
          <span className="hud-label text-hud-green">ONLINE</span>
        </div>
      </div>
    </header>
  )
}
