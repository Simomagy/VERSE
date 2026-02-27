import type { Variants } from 'framer-motion'

/**
 * Simula l'accensione di un display olografico/CRT:
 * opacità irregolare prima di stabilizzarsi.
 */
export const PAGE_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: [0, 0.55, 0.2, 0.85, 0.6, 1] as number[],
    transition: { duration: 0.45, times: [0, 0.07, 0.18, 0.5, 0.72, 1] }
  },
  exit: { opacity: 0, transition: { duration: 0.1 } }
}

/**
 * Container lista: orchestra lo stagger dei figli.
 * I child con ROW_VARIANTS entrano uno dopo l'altro.
 */
export const LIST_VARIANTS: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.045, delayChildren: 0.06 } }
}

/**
 * Singola riga lista: slide da sinistra + flicker CRT.
 * exit: slide verso destra + fade rapido.
 */
export const ROW_VARIANTS: Variants = {
  initial: { opacity: 0, x: -8 },
  animate: {
    opacity: [0, 0.5, 0.25, 0.8, 0.6, 1] as number[],
    x: 0,
    transition: {
      opacity: { duration: 0.28, times: [0, 0.1, 0.22, 0.5, 0.72, 1] },
      x:       { duration: 0.18, ease: 'easeOut' as const }
    }
  },
  exit: { opacity: 0, x: 8, transition: { duration: 0.1 } }
}

/** Backdrop modal: semplice fade */
export const BACKDROP_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit:    { opacity: 0, transition: { duration: 0.1  } }
}

/**
 * Pannello modal HUD: scan reveal sinistra→destra (clip-path)
 * seguito da un breve flicker prima di stabilizzarsi.
 * Eredita initial/animate/exit dal backdrop genitore.
 */
export const MODAL_VARIANTS: Variants = {
  initial: { clipPath: 'inset(0 100% 0 0)', opacity: 0.6 },
  animate: {
    clipPath: 'inset(0 0% 0 0)',
    opacity: [0.6, 0.35, 0.9, 0.7, 1] as number[],
    transition: {
      clipPath: { duration: 0.22, ease: 'easeOut' as const },
      opacity:  { duration: 0.35, times: [0, 0.12, 0.45, 0.7, 1], delay: 0.06 }
    }
  },
  exit: {
    clipPath: 'inset(0 100% 0 0)',
    opacity: 0,
    transition: { duration: 0.14, ease: 'easeIn' as const }
  }
}
