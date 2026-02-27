import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, ExternalLink, AlertTriangle } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useAuthStore } from '../../stores/auth.store'
import wavyLines from '../../assets/wavy-lines.svg'

const PANEL_VARIANTS = {
  initial: { opacity: 0, y: 24, scale: 0.97 },
  animate: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.35, ease: 'easeOut' as const, delay: 0.1 } }
}

const LOGO_VARIANTS = {
  initial: { opacity: 0 },
  animate: {
    opacity: [0, 0.55, 0.2, 0.9, 0.6, 1] as number[],
    transition: { duration: 0.5, times: [0, 0.08, 0.2, 0.5, 0.72, 1] }
  }
}

interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { setAppToken } = useAuthStore()
  const [token, setToken]   = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const isValid = token.trim().length > 8

  const handleSubmit = async () => {
    if (!isValid) return
    setSaving(true)
    setError(null)
    try {
      await setAppToken(token.trim())
      onComplete()
    } catch {
      setError('Failed to save token. Please try again.')
      setSaving(false)
    }
  }

  const openDocs = () =>
    window.electron.ipcRenderer.send('open-external', 'https://uexcorp.space/api/my-apps')

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-hud-deep overflow-hidden">
      {/* Sfondo decorativo */}
      <img
        src={wavyLines}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-15"
      />

      {/* Scanline */}
      <div className="absolute inset-0 hud-scanline pointer-events-none opacity-20" />

      {/* Corner decorations */}
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
        {/* Logo */}
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
            UEX Corp Companion — First Launch
          </p>
        </motion.div>

        {/* Panel */}
        <div className="bg-hud-panel border border-hud-border relative">
          {/* Corner brackets */}
          <span className="absolute top-0 left-0 w-4 h-px bg-hud-cyan/60" />
          <span className="absolute top-0 left-0 w-px h-4 bg-hud-cyan/60" />
          <span className="absolute bottom-0 right-0 w-4 h-px bg-hud-cyan/60" />
          <span className="absolute bottom-0 right-0 w-px h-4 bg-hud-cyan/60" />

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-hud-border">
            <ShieldCheck className="h-4 w-4 text-hud-cyan shrink-0" />
            <span className="hud-label text-hud-text tracking-widest">API AUTHENTICATION REQUIRED</span>
          </div>

          <div className="p-5 space-y-5">
            {/* Description */}
            <div className="space-y-2">
              <p className="font-mono text-sm text-hud-text">
                UEX Corp Bearer Token
              </p>
              <p className="hud-label text-hud-muted leading-relaxed">
                VERSE requires a UEX Corp Application Token to access market data,
                refinery methods, commodity prices and station information.
              </p>
              <button
                onClick={openDocs}
                className="flex items-center gap-1.5 hud-label text-hud-cyan hover:text-hud-cyan/80 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Get your token at uexcorp.space/api/my-apps
              </button>
            </div>

            {/* Input */}
            <div className="space-y-2">
              <label className="hud-label text-hud-muted block">
                APPLICATION TOKEN <span className="text-hud-red">*</span>
              </label>
              <Input
                type="password"
                placeholder="Paste your Bearer token here..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && isValid && handleSubmit()}
                autoFocus
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 border border-hud-red/40 bg-hud-red/10">
                <AlertTriangle className="h-3.5 w-3.5 text-hud-red shrink-0" />
                <span className="hud-label text-hud-red">{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                variant="hud-ghost"
                className="flex-1 text-hud-muted"
                onClick={onComplete}
              >
                SKIP FOR NOW
              </Button>
              <Button
                className="flex-1 border-hud-cyan text-hud-cyan hover:bg-hud-cyan/10
                  hover:shadow-[0_0_12px_rgba(0,229,255,0.3)] font-mono text-xs
                  tracking-widest uppercase bg-transparent border"
                onClick={handleSubmit}
                disabled={!isValid || saving}
              >
                {saving ? 'SAVING...' : 'CONNECT'}
              </Button>
            </div>

            <p className="hud-label text-hud-dim text-center">
              Token is encrypted and stored locally. You can update it anytime in Settings.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
