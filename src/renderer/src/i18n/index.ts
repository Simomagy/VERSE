import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'

export interface Language {
  code: string
  label: string
}

export const AVAILABLE_LANGUAGES: Language[] = [{ code: 'en', label: 'English' }]

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: en }
  },
  interpolation: { escapeValue: false }
})

export default i18n
