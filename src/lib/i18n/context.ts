
import { createContext, useContext } from 'react';
import type { Language } from './locales';

export interface I18nContextType {
  currentLanguage: Language;
  t: (key: string, options?: Record<string, string | number>) => string;
  changeLanguage: (lang: Language) => void;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useTranslation = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
