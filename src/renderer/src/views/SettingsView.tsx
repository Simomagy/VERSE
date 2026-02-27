import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, Loader2, Settings, FlaskConical } from 'lucide-react'
import { useAuthStore } from '../stores/auth.store'
import { Onboarding } from '../components/layout/Onboarding'
import { useSettingsStore } from '../stores/settings.store'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'

// ── Sezione generica ──────────────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="hud-panel p-5 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-hud-border">
        <span className="w-px h-4 bg-hud-cyan" />
        <span className="hud-label text-hud-text tracking-widest">{label}</span>
      </div>
      {children}
    </div>
  )
}

// ── Riga impostazione toggle ──────────────────────────────────────────────
function ToggleRow({
  label,
  description,
  value,
  onChange
}: {
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-mono text-sm text-hud-text">{label}</p>
        <p className="hud-label text-hud-muted mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 border transition-all duration-200 shrink-0 ${
          value
            ? 'border-hud-cyan bg-hud-cyan/20 shadow-[0_0_8px_rgba(0,229,255,0.3)]'
            : 'border-hud-border bg-hud-deep'
        }`}
        aria-pressed={value}
      >
        <span className={`absolute top-0.5 h-3.5 w-3.5 border transition-all duration-200 ${
          value
            ? 'left-[calc(100%-16px)] border-hud-cyan bg-hud-cyan'
            : 'left-0.5 border-hud-muted bg-hud-muted'
        }`} />
      </button>
    </div>
  )
}

// ── Toast status ──────────────────────────────────────────────────────────
function StatusToast({ status, message }: { status: 'saving' | 'success' | 'error'; message: string }) {
  const colors = {
    saving:  'border-hud-cyan   bg-hud-cyan/10   text-hud-cyan',
    success: 'border-hud-green  bg-hud-green/10  text-hud-green',
    error:   'border-hud-red    bg-hud-red/10    text-hud-red',
  }
  const icons = {
    saving:  <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />,
    success: <CheckCircle className="h-3.5 w-3.5 shrink-0" />,
    error:   <AlertCircle className="h-3.5 w-3.5 shrink-0" />,
  }
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 border ${colors[status]}`}>
      {icons[status]}
      <span className="hud-label">{message}</span>
    </div>
  )
}

function AppVersion() {
  const [version, setVersion] = useState<string>('…')
  useEffect(() => {
    if (typeof window.api?.app?.version === 'function') {
      window.api.app.version().then(setVersion).catch(() => setVersion('?'))
    }
  }, [])
  return <p className="hud-label text-hud-dim mt-0.5">Version {version} · Electron + React</p>
}

// ── Main view ─────────────────────────────────────────────────────────────
export function SettingsView() {
  const { isAppTokenSet, setAppToken, loadTokens } = useAuthStore()

  const {
    minimizeToTray,
    notifications,
    hotkey,
    updateSettings,
    updateHotkey,
    loadSettings
  } = useSettingsStore()

  const [appTokenInput,    setAppTokenInput]    = useState('')
  const [hotkeyInput,      setHotkeyInput]      = useState('')
  const [showOnboarding,   setShowOnboarding]   = useState(false)
  const [toast, setToast] = useState<{ status: 'saving' | 'success' | 'error'; message: string } | null>(null)

  useEffect(() => { loadTokens(); loadSettings() }, [])
  useEffect(() => { setHotkeyInput(hotkey) }, [hotkey])

  const showToast = (status: 'saving' | 'success' | 'error', message: string) => {
    setToast({ status, message })
    if (status !== 'saving') setTimeout(() => setToast(null), 3000)
  }

  const handleSaveAppToken = async () => {
    if (!appTokenInput.trim()) return
    showToast('saving', 'Saving application token...')
    try {
      await setAppToken(appTokenInput.trim())
      setAppTokenInput('')
      showToast('success', 'Application token saved')
    } catch {
      showToast('error', 'Failed to save application token')
    }
  }

  const handleSaveHotkey = async () => {
    if (!hotkeyInput.trim()) return
    showToast('saving', 'Registering hotkey...')
    const ok = await updateHotkey(hotkeyInput.trim())
    ok
      ? showToast('success', 'Hotkey updated')
      : showToast('error', 'Failed to register hotkey — may be in use')
  }

  return (
    <>
    <div className="flex flex-col h-full w-full p-5 gap-4 overflow-y-auto scrollbar-hud">
      {/* Header sezione con accento purple */}
      <div className="hud-section-config px-3 py-3 border border-hud-purple/20">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5 text-hud-purple drop-shadow-[0_0_4px_rgba(160,96,255,0.8)]" />
          <div>
            <h1 className="font-mono text-sm font-bold tracking-[0.15em] text-hud-purple uppercase"
              style={{ textShadow: '0 0 8px rgba(160,96,255,0.4)' }}>
              System Config
            </h1>
            <p className="hud-label mt-0.5 text-hud-muted">VERSE — UEX Corp Companion</p>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && <StatusToast status={toast.status} message={toast.message} />}

      {/* API Authentication */}
      <Section label="API AUTHENTICATION">
        <p className="hud-label text-hud-muted -mt-1">
          Tokens from{' '}
          <button
            className="text-hud-cyan hover:underline"
            onClick={() => window.electron.ipcRenderer.send('open-external', 'https://uexcorp.space/api/my-apps')}
          >
            uexcorp.space/api/my-apps
          </button>
        </p>

        {/* App token */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm text-hud-text">Application Token</p>
              <p className="hud-label text-hud-muted mt-0.5">Market prices, routes, public data</p>
            </div>
            <Badge variant={isAppTokenSet ? 'green' : 'secondary'}>
              {isAppTokenSet ? 'ACTIVE' : 'NOT SET'}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="Enter application token..."
              value={appTokenInput}
              onChange={(e) => setAppTokenInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveAppToken()}
              className="flex-1"
            />
            <Button variant="hud" size="sm" onClick={handleSaveAppToken} disabled={!appTokenInput.trim()}>
              SAVE
            </Button>
          </div>
        </div>

      </Section>

      {/* Hotkey */}
      <Section label="GLOBAL HOTKEY">
        <p className="hud-label text-hud-muted -mt-1">Keyboard shortcut to show/hide VERSE</p>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="e.g. CommandOrControl+Shift+V"
              value={hotkeyInput}
              onChange={(e) => setHotkeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveHotkey()}
              className="flex-1"
            />
            <Button variant="hud" size="sm" onClick={handleSaveHotkey} disabled={!hotkeyInput.trim()}>
              UPDATE
            </Button>
          </div>
          <p className="hud-label text-hud-dim">
            Current: <code className="font-mono text-hud-muted">{hotkey}</code>
          </p>
          <p className="hud-label text-hud-dim">
            Modifiers: CommandOrControl, Alt, Shift, Ctrl, Command (Mac)
          </p>
        </div>
      </Section>

      {/* Preferences */}
      <Section label="PREFERENCES">
        <ToggleRow
          label="Minimize to Tray"
          description="Keep running in system tray when window is closed"
          value={minimizeToTray}
          onChange={(v) => updateSettings({ minimizeToTray: v })}
        />
        <hr className="hud-divider" />
        <ToggleRow
          label="Notifications"
          description="Desktop notifications for important events"
          value={notifications}
          onChange={(v) => updateSettings({ notifications: v })}
        />
      </Section>

      {/* DEV TOOLS — visibile solo in dev mode */}
      {import.meta.env.DEV && (
        <Section label="⚡ DEV TOOLS">
          <p className="hud-label text-hud-amber -mt-1">Only visible in development mode</p>
          <button
            onClick={() => setShowOnboarding(true)}
            className="flex items-center gap-2 px-3 py-2 border border-hud-amber/40 text-hud-amber
              hover:bg-hud-amber/10 hover:border-hud-amber transition-all duration-150
              font-mono text-xs tracking-widest uppercase"
          >
            <FlaskConical className="h-3.5 w-3.5" />
            Preview Onboarding
          </button>
        </Section>
      )}

      {/* About */}
      <div className="hud-panel p-4">
        <div className="flex items-center gap-3">
          <div className="font-mono text-xl font-black tracking-[0.3em] hud-text-cyan">VERSE</div>
          <div className="h-6 w-px bg-hud-border" />
          <div>
            <p className="hud-label text-hud-text">UEX Corp Companion for Star Citizen</p>
            <AppVersion />
          </div>
        </div>
      </div>
    </div>

    {showOnboarding && (
      <Onboarding onComplete={() => setShowOnboarding(false)} />
    )}
    </>
  )
}
