import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, ExternalLink, AlertTriangle, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Select } from '../ui/select'
import { useAuthStore } from '../../stores/auth.store'
import { useSettingsStore } from '../../stores/settings.store'
import i18n, { AVAILABLE_LANGUAGES } from '../../i18n'
import wavyLines from '../../assets/wavy-lines.svg'

// ── Constants ─────────────────────────────────────────────────────────────────

type OnboardingStep = 'language' | 'token'

// ── Variants ──────────────────────────────────────────────────────────────────

const PANEL_VARIANTS = {
  initial: { opacity: 0, y: 24, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: 'easeOut' as const, delay: 0.1 }
  }
}

const LOGO_VARIANTS = {
  initial: { opacity: 0 },
  animate: {
    opacity: [0, 0.55, 0.2, 0.9, 0.6, 1] as number[],
    transition: { duration: 0.5, times: [0, 0.08, 0.2, 0.5, 0.72, 1] }
  }
}

const STEP_ENTER: Record<OnboardingStep, { opacity: number; x: number }> = {
  language: { opacity: 0, x: -20 },
  token: { opacity: 0, x: 20 }
}

const STEP_EXIT: Record<OnboardingStep, { opacity: number; x: number }> = {
  language: { opacity: 0, x: -20 },
  token: { opacity: 0, x: 20 }
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface LanguageStepProps {
  selected: string
  onSelect: (code: string) => void
  onContinue: () => void
}

function LanguageStep({ selected, onSelect, onContinue }: LanguageStepProps) {
  const { t } = useTranslation()

  return (
    <div className="p-5 space-y-5">
      <p className="hud-label text-hud-muted leading-relaxed">{t('onboarding.language.hint')}</p>

      <div className="space-y-2">
        <label className="hud-label text-hud-muted block">
          {t('onboarding.language.label')}
        </label>
        <Select
          value={selected}
          onValueChange={onSelect}
          options={AVAILABLE_LANGUAGES.map((lang) => ({ value: lang.code, label: lang.label }))}
        />
      </div>

      <Button
        className="w-full border-hud-cyan text-hud-cyan hover:bg-hud-cyan/10
          hover:shadow-[0_0_12px_rgba(0,229,255,0.3)] font-mono text-xs
          tracking-widest uppercase bg-transparent border"
        onClick={onContinue}
      >
        {t('onboarding.language.continue')}
      </Button>
    </div>
  )
}

interface TokenStepProps {
  onComplete: () => void
}

function TokenStep({ onComplete }: TokenStepProps) {
  const { t } = useTranslation()
  const { setAppToken } = useAuthStore()
  const [token, setToken] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValid = token.trim().length > 8

  const handleSubmit = async () => {
    if (!isValid) return
    setSaving(true)
    setError(null)
    try {
      await setAppToken(token.trim())
      onComplete()
    } catch {
      setError(t('onboarding.token.error'))
      setSaving(false)
    }
  }

  const openDocs = () =>
    window.electron.ipcRenderer.send('open-external', 'https://uexcorp.space/api/my-apps')

  return (
    <div className="p-5 space-y-5">
      <div className="space-y-2">
        <p className="font-mono text-sm text-hud-text">{t('onboarding.token.description')}</p>
        <p className="hud-label text-hud-muted leading-relaxed">{t('onboarding.token.body')}</p>
        <button
          onClick={openDocs}
          className="flex items-center gap-1.5 hud-label text-hud-cyan hover:text-hud-cyan/80 transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          {t('onboarding.token.link')}
        </button>
      </div>

      <div className="space-y-2">
        <label className="hud-label text-hud-muted block">
          {t('onboarding.token.label')} <span className="text-hud-red">*</span>
        </label>
        <Input
          type="password"
          placeholder={t('onboarding.token.placeholder')}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && isValid && handleSubmit()}
          autoFocus
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 border border-hud-red/40 bg-hud-red/10">
          <AlertTriangle className="h-3.5 w-3.5 text-hud-red shrink-0" />
          <span className="hud-label text-hud-red">{error}</span>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button variant="hud-ghost" className="flex-1 text-hud-muted" onClick={onComplete}>
          {t('onboarding.token.skip')}
        </Button>
        <Button
          className="flex-1 border-hud-cyan text-hud-cyan hover:bg-hud-cyan/10
            hover:shadow-[0_0_12px_rgba(0,229,255,0.3)] font-mono text-xs
            tracking-widest uppercase bg-transparent border"
          onClick={handleSubmit}
          disabled={!isValid || saving}
        >
          {saving ? t('onboarding.token.saving') : t('onboarding.token.connect')}
        </Button>
      </div>

      <p className="hud-label text-hud-dim text-center">{t('onboarding.token.footer')}</p>
    </div>
  )
}

// ── Step header icons & labels ─────────────────────────────────────────────────

const STEP_HEADER: Record<OnboardingStep, { icon: React.ReactNode; labelKey: string }> = {
  language: {
    icon: <Globe className="h-4 w-4 text-hud-cyan shrink-0" />,
    labelKey: 'onboarding.language.header'
  },
  token: {
    icon: <ShieldCheck className="h-4 w-4 text-hud-cyan shrink-0" />,
    labelKey: 'onboarding.token.header'
  }
}

// ── Main component ────────────────────────────────────────────────────────────

interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { t } = useTranslation()
  const updateSettings = useSettingsStore((state) => state.updateSettings)

  const [step, setStep] = useState<OnboardingStep>('language')
  const [selectedLanguage, setSelectedLanguage] = useState('en')

  const handleLanguageSelect = (code: string) => {
    setSelectedLanguage(code)
    i18n.changeLanguage(code)
  }

  const handleLanguageContinue = async () => {
    await updateSettings({ language: selectedLanguage })
    setStep('token')
  }

  const header = STEP_HEADER[step]

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-hud-deep overflow-hidden">
      <img
        src={wavyLines}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-15"
      />

      <div className="absolute inset-0 hud-scanline pointer-events-none opacity-20" />

      <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-hud-cyan/40" />
      <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-hud-cyan/40" />
      <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-hud-cyan/40" />
      <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-hud-cyan/40" />

      <motion.div
        className="w-full max-w-md px-4"
        variants={PANEL_VARIANTS}
        initial="initial"
        animate="animate"
      >
        <motion.div
          className="text-center mb-8"
          variants={LOGO_VARIANTS}
          initial="initial"
          animate="animate"
        >
          <h1 className="font-mono text-4xl font-bold tracking-[0.3em] hud-text-cyan mb-1">
            VERSE
          </h1>
          <p className="font-mono text-[10px] tracking-[0.25em] text-hud-muted uppercase">
            {t('onboarding.subtitle')}
          </p>
        </motion.div>

        <div className="bg-hud-panel border border-hud-border relative">
          <span className="absolute top-0 left-0 w-4 h-px bg-hud-cyan/60" />
          <span className="absolute top-0 left-0 w-px h-4 bg-hud-cyan/60" />
          <span className="absolute bottom-0 right-0 w-4 h-px bg-hud-cyan/60" />
          <span className="absolute bottom-0 right-0 w-px h-4 bg-hud-cyan/60" />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={STEP_ENTER[step]}
              animate={{ opacity: 1, x: 0 }}
              exit={STEP_EXIT[step]}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-hud-border">
                {header.icon}
                <span className="hud-label text-hud-text tracking-widest">
                  {t(header.labelKey)}
                </span>
              </div>

              {step === 'language' && (
                <LanguageStep
                  selected={selectedLanguage}
                  onSelect={handleLanguageSelect}
                  onContinue={handleLanguageContinue}
                />
              )}

              {step === 'token' && <TokenStep onComplete={onComplete} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
