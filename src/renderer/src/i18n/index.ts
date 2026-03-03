import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'
import tr from './locales/tr'
import it from './locales/it'

export interface Language {
  code: string
  label: string
}

export const AVAILABLE_LANGUAGES: Language[] = [{ code: 'en', label: 'English' }, { code: 'tr', label: 'Turkish' }, { code: 'it', label: 'Italian' }]

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    tr: { translation: tr },
    it: { translation: it }
  },
  interpolation: { escapeValue: false }
})

export const languageCredits = {
  en: 'Prysma Studio',
  tr: 'Emergency-Crazy-348',
  it: 'Prysma Studio'
}

export default i18n
