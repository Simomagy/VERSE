import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, Loader2, Settings, FlaskConical } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/auth.store'
import { Onboarding } from '../components/layout/Onboarding'
import { useSettingsStore } from '../stores/settings.store'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import i18n, { AVAILABLE_LANGUAGES, languageCredits } from '../i18n'
import { Select } from '../components/ui/select'

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
        <span
          className={`absolute top-0.5 h-3.5 w-3.5 border transition-all duration-200 ${
            value
              ? 'left-[calc(100%-16px)] border-hud-cyan bg-hud-cyan'
              : 'left-0.5 border-hud-muted bg-hud-muted'
          }`}
        />
      </button>
    </div>
  )
}

// ── Popup crediti traduzioni ──────────────────────────────────────────────
function TranslationCreditsPopup({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute right-0 top-full mt-1.5 z-50 min-w-[200px] border border-hud-border bg-hud-panel shadow-lg"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}
      >
        <div className="px-3 py-2 border-b border-hud-border/60">
          <span className="hud-label text-hud-cyan tracking-widest" style={{ fontSize: '9px' }}>
            {t('settings.preferences.language.credits').toUpperCase()}
          </span>
        </div>
        <div className="py-1">
          {AVAILABLE_LANGUAGES.map((lang) => (
            <div key={lang.code} className="flex items-center justify-between gap-4 px-3 py-1.5">
              <span className="font-mono text-[10px] text-hud-muted tracking-wider">
                {lang.code.toUpperCase()}
              </span>
              <span className="font-mono text-[10px] text-hud-text">
                {languageCredits[lang.code as keyof typeof languageCredits] ?? '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ── Toast status ──────────────────────────────────────────────────────────
function StatusToast({
  status,
  message
}: {
  status: 'saving' | 'success' | 'error'
  message: string
}) {
  const colors = {
    saving: 'border-hud-cyan   bg-hud-cyan/10   text-hud-cyan',
    success: 'border-hud-green  bg-hud-green/10  text-hud-green',
    error: 'border-hud-red    bg-hud-red/10    text-hud-red'
  }
  const icons = {
    saving: <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />,
    success: <CheckCircle className="h-3.5 w-3.5 shrink-0" />,
    error: <AlertCircle className="h-3.5 w-3.5 shrink-0" />
  }
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 border ${colors[status]}`}>
      {icons[status]}
      <span className="hud-label">{message}</span>
    </div>
  )
}

function AppVersion() {
  const { t } = useTranslation()
  const [version, setVersion] = useState<string>('…')
  useEffect(() => {
    if (typeof window.api?.app?.version === 'function') {
      window.api.app
        .version()
        .then(setVersion)
        .catch(() => setVersion('?'))
    }
  }, [])
  return <p className="hud-label text-hud-dim mt-0.5">{t('settings.about.version', { version })}</p>
}

// ── Main view ─────────────────────────────────────────────────────────────
export function SettingsView() {
  const { t } = useTranslation()
  const { isAppTokenSet, setAppToken, loadTokens } = useAuthStore()

  const { minimizeToTray, notifications, hotkey, language, updateSettings, updateHotkey, loadSettings } =
    useSettingsStore()

  const [appTokenInput, setAppTokenInput] = useState('')
  const [hotkeyInput, setHotkeyInput] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [creditsOpen, setCreditsOpen] = useState(false)
  const [toast, setToast] = useState<{
    status: 'saving' | 'success' | 'error'
    message: string
  } | null>(null)

  useEffect(() => {
    loadTokens()
    loadSettings()
  }, [])
  useEffect(() => {
    setHotkeyInput(hotkey)
  }, [hotkey])

  const showToast = (status: 'saving' | 'success' | 'error', message: string) => {
    setToast({ status, message })
    if (status !== 'saving') setTimeout(() => setToast(null), 3000)
  }

  const handleSaveAppToken = async () => {
    if (!appTokenInput.trim()) return
    showToast('saving', t('settings.auth.toast.saving'))
    try {
      await setAppToken(appTokenInput.trim())
      setAppTokenInput('')
      showToast('success', t('settings.auth.toast.success'))
    } catch {
      showToast('error', t('settings.auth.toast.error'))
    }
  }

  const handleSaveHotkey = async () => {
    if (!hotkeyInput.trim()) return
    showToast('saving', t('settings.hotkey.toast.saving'))
    const ok = await updateHotkey(hotkeyInput.trim())
    ok
      ? showToast('success', t('settings.hotkey.toast.success'))
      : showToast('error', t('settings.hotkey.toast.error'))
  }

  return (
    <>
      <div className="flex flex-col h-full w-full p-5 gap-4 overflow-y-auto scrollbar-hud">
        {/* Header sezione con accento purple */}
        <div className="hud-section-config px-3 py-3 border border-hud-purple/20">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-hud-purple drop-shadow-[0_0_4px_rgba(160,96,255,0.8)]" />
            <div>
              <h1
                className="font-mono text-sm font-bold tracking-[0.15em] text-hud-purple uppercase"
                style={{ textShadow: '0 0 8px rgba(160,96,255,0.4)' }}
              >
                {t('settings.title')}
              </h1>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && <StatusToast status={toast.status} message={toast.message} />}

        {/* API Authentication */}
        <Section label={t('settings.auth.header')}>
          <p className="hud-label text-hud-muted -mt-1">
            {t('settings.auth.tokensFrom')}{' '}
            <button
              className="text-hud-cyan hover:underline"
              onClick={() =>
                window.electron.ipcRenderer.send(
                  'open-external',
                  'https://uexcorp.space/api/my-apps'
                )
              }
            >
              uexcorp.space/api/my-apps
            </button>
          </p>

          {/* App token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-sm text-hud-text">{t('settings.auth.appToken.label')}</p>
                <p className="hud-label text-hud-muted mt-0.5">
                  {t('settings.auth.appToken.description')}
                </p>
              </div>
              <Badge variant={isAppTokenSet ? 'green' : 'secondary'}>
                {isAppTokenSet ? t('settings.auth.appToken.active') : t('settings.auth.appToken.notSet')}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder={t('settings.auth.appToken.placeholder')}
                value={appTokenInput}
                onChange={(e) => setAppTokenInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveAppToken()}
                className="flex-1"
              />
              <Button
                variant="hud"
                size="sm"
                onClick={handleSaveAppToken}
                disabled={!appTokenInput.trim()}
              >
                {t('settings.auth.save')}
              </Button>
            </div>
          </div>
        </Section>

        {/* Hotkey */}
        <Section label={t('settings.hotkey.header')}>
          <p className="hud-label text-hud-muted -mt-1">{t('settings.hotkey.description')}</p>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder={t('settings.hotkey.placeholder')}
                value={hotkeyInput}
                onChange={(e) => setHotkeyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveHotkey()}
                className="flex-1"
              />
              <Button
                variant="hud"
                size="sm"
                onClick={handleSaveHotkey}
                disabled={!hotkeyInput.trim()}
              >
                {t('settings.hotkey.update')}
              </Button>
            </div>
            <p className="hud-label text-hud-dim">
              {t('settings.hotkey.current')} <code className="font-mono text-hud-muted">{hotkey}</code>
            </p>
            <p className="hud-label text-hud-dim">
              {t('settings.hotkey.modifiers')}
            </p>
          </div>
        </Section>

        {/* Preferences */}
        <Section label={t('settings.preferences.header')}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-sm text-hud-text">{t('settings.preferences.language.label')}</p>
              <p className="hud-label text-hud-muted mt-0.5">{t('settings.preferences.language.description')}</p>
            </div>
            <div className="flex flex-col items-end gap-1 relative">
              <Select
                value={language}
                onValueChange={(code) => {
                  i18n.changeLanguage(code)
                  updateSettings({ language: code })
                }}
                options={AVAILABLE_LANGUAGES.map((lang) => ({ value: lang.code, label: lang.label }))}
              />
              <button
                onClick={() => setCreditsOpen((v) => !v)}
                className="hud-label text-hud-dim hover:text-hud-cyan transition-colors"
                style={{ fontSize: '9px' }}
              >
                {t('settings.preferences.language.credits')}
              </button>
              {creditsOpen && <TranslationCreditsPopup onClose={() => setCreditsOpen(false)} />}
            </div>
          </div>
          <hr className="hud-divider" />
          <ToggleRow
            label={t('settings.preferences.minimizeToTray.label')}
            description={t('settings.preferences.minimizeToTray.description')}
            value={minimizeToTray}
            onChange={(v) => updateSettings({ minimizeToTray: v })}
          />
          <hr className="hud-divider" />
          <ToggleRow
            label={t('settings.preferences.notifications.label')}
            description={t('settings.preferences.notifications.description')}
            value={notifications}
            onChange={(v) => updateSettings({ notifications: v })}
          />
        </Section>

        {/* DEV TOOLS — visibile solo in dev mode */}
        {import.meta.env.DEV && (
          <Section label={t('settings.devTools.header')}>
            <p className="hud-label text-hud-amber -mt-1">{t('settings.devTools.description')}</p>
            <button
              onClick={() => setShowOnboarding(true)}
              className="flex items-center gap-2 px-3 py-2 border border-hud-amber/40 text-hud-amber
              hover:bg-hud-amber/10 hover:border-hud-amber transition-all duration-150
              font-mono text-xs tracking-widest uppercase"
            >
              <FlaskConical className="h-3.5 w-3.5" />
              {t('settings.devTools.previewOnboarding')}
            </button>
          </Section>
        )}

        {/* About */}
        <div className="hud-panel p-4">
          <div className="flex items-center gap-3">
            <div className="font-mono text-xl font-black tracking-[0.3em] hud-text-cyan">VERSE</div>
            <div className="h-6 w-px bg-hud-border" />
            <div>
              <p className="hud-label text-hud-text">{t('settings.about.author')}</p>
              <AppVersion />
            </div>
          </div>
        </div>
      </div>

      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
    </>
  )
}
