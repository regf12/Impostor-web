
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { I18nContext } from './context';
import { translations, SUPPORTED_LANGUAGES, type Language, type Translations } from './locales';

const getNestedTranslation = (lang: Language, key: string): string | undefined => {
  const keys = key.split('.');
  let result: any = translations[lang];
  for (const k of keys) {
    result = result?.[k];
    if (result === undefined) {
      // Fallback to English if not found
      const fallbackResult: any = translations['en'];
      let fallback: any = fallbackResult;
      for (const fk of keys) {
        fallback = fallback?.[fk];
        if(fallback === undefined) return undefined;
      }
      return fallback as string | undefined;
    }
  }
  return result as string | undefined;
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0] as Language;
    if (SUPPORTED_LANGUAGES.includes(browserLang)) {
      setCurrentLanguage(browserLang);
    } else {
      setCurrentLanguage('en'); 
    }
  }, []);

  const changeLanguage = useCallback((lang: Language) => {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
        setCurrentLanguage(lang);
    }
  }, []);

  const t = useCallback((key: string, options?: Record<string, string | number>): string => {
    let translation = getNestedTranslation(currentLanguage, key);

    if (!translation) {
      translation = getNestedTranslation('en', key);
    }

    if (!translation) {
      console.warn(`[i18n] Missing translation for key: ${key}`);
      return key;
    }

    if (options) {
      Object.keys(options).forEach(optionKey => {
        translation = translation!.replace(`{{${optionKey}}}`, String(options[optionKey]));
      });
    }

    return translation;
  }, [currentLanguage]);

  const value = { currentLanguage, t, changeLanguage };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};
