import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translation files for only 4 languages
import enTranslations from './locales/en.json';
import trTranslations from './locales/tr.json';
import esTranslations from './locales/es.json';
import frTranslations from './locales/fr.json';

const resources = {
  en: { translation: enTranslations },
  tr: { translation: trTranslations },
  es: { translation: esTranslations },
  fr: { translation: frTranslations }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    backend: {
      loadPath: '/locales/{{lng}}.json',
    },
  });

export default i18n;