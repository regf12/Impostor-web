
import es from './locales/es.json';
import en from './locales/en.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import ja from './locales/ja.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';

export type Language = 'es' | 'en' | 'de' | 'fr' | 'it' | 'ja' | 'pt' | 'ru';

export type Translations = {
  [key: string]: string | Translations;
};

export const translations: Record<Language, Translations> = {
  es,
  en,
  de,
  fr,
  it,
  ja,
  pt,
  ru,
};

export const SUPPORTED_LANGUAGES: Language[] = ['es', 'en', 'de', 'fr', 'it', 'ja', 'pt', 'ru'];
