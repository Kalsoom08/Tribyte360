import { Injectable } from '@nestjs/common';

const translations: Record<string, Record<string, string>> = {
  en: {
    'welcome': 'Welcome to Tribyte360',
    'unauthorized': 'Unauthorized access',
    'tenant_not_found': 'Tenant not found',
    'user_not_found': 'User not found',
  },
  de: {
    'welcome': 'Willkommen bei Tribyte360',
    'unauthorized': 'Unbefugter Zugriff',
    'tenant_not_found': 'Mandant nicht gefunden',
    'user_not_found': 'Benutzer nicht gefunden',
  },
  ur: {
    'welcome': 'ٹرائی بائٹ 360 میں خوش آمدید',
    'unauthorized': 'غیر مجاز رسائی',
    'tenant_not_found': 'ٹیننٹ نہیں ملا',
    'user_not_found': 'صارف نہیں ملا',
  },
};

@Injectable()
export class I18nService {
  translate(key: string, lang: string = 'en'): string {
    const activeLang = translations[lang] ? lang : 'en';
    return translations[activeLang][key] || key;
  }
}
