/**
 * Language Service - manages interface language state
 */

import { translations, Lang } from '../translations';

const LANG_STORAGE_KEY = 'resume-lang';

export class LanguageService {
  private currentLang: Lang = 'en';

  constructor() {
    this.currentLang = this.loadSavedLang();
  }

  public getLang(): Lang {
    return this.currentLang;
  }

  public setLang(lang: Lang): void {
    this.currentLang = lang;
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  }

  public getTranslation(key: keyof typeof translations.en): string {
    const translation = translations[this.currentLang]?.[key as keyof (typeof translations)[typeof this.currentLang]];
    if (translation === undefined || translation === null) {
      return translations.en[key] ?? key;
    }
    return translation as string;
  }

  private loadSavedLang(): Lang {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'en' || saved === 'ru' || saved === 'ko') {
      return saved;
    }
    return 'en';
  }
}
