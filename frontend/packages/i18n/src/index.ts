export const translations = {
  en: {
    welcome: 'Welcome to Tribyte360',
    dashboard: 'Dashboard',
    users: 'Users',
    settings: 'Settings',
  },
  de: {
    welcome: 'Willkommen bei Tribyte360',
    dashboard: 'Übersicht',
    users: 'Benutzer',
    settings: 'Einstellungen',
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKeys = keyof typeof translations['en'];

export function getTranslation(key: TranslationKeys, lang: Language = 'en'): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}
