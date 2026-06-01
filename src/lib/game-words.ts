
import type { Language } from './i18n';

export type GameWord = {
  secretWord: string;
  hint: string;
};

const GAME_WORDS_ES: GameWord[] = [
  { secretWord: "Plátano", hint: "Pijama" },
  { secretWord: "Guitarra", hint: "Cuerpo" },
  { secretWord: "Sol", hint: "Girasol" },
  { secretWord: "Coche", hint: "Gato" },
  { secretWord: "Mesa", hint: "Redonda" },
  { secretWord: "Libro", hint: "Cara" },
  { secretWord: "Agua", hint: "Fiestas" },
  { secretWord: "Gato", hint: "Lengua" },
  { secretWord: "Luna", hint: "Miel" },
  { secretWord: "Café", hint: "Teatro" },
  { secretWord: "Martillo", hint: "Juicio" },
  { secretWord: "Cangrejo", hint: "Araña" },
  { secretWord: "Lirio", hint: "Voz" },
  { secretWord: "Serpiente", hint: "Escalera" },
  { secretWord: "Nube", hint: "Almacenamiento" },
  { secretWord: "Ratón", hint: "Accesorio PC" },
  { secretWord: "Puente", hint: "Día festivo" },
  { secretWord: "Banco", hint: "Parque" },
  { secretWord: "Red", hint: "Social" },
  { secretWord: "Hoja", hint: "Cálculo" },
];

const GAME_WORDS_EN: GameWord[] = [
    { secretWord: "Banana", hint: "Pajama" },
    { secretWord: "Guitar", hint: "Body" },
    { secretWord: "Sun", hint: "Sunflower" },
    { secretWord: "Car", hint: "Jack" },
    { secretWord: "Table", hint: "Round" },
    { secretWord: "Book", hint: "Face" },
    { secretWord: "Water", hint: "Party" }, // To rain on someone's parade (aguafiestas)
    { secretWord: "Cat", hint: "Tongue" }, // Cat got your tongue
    { secretWord: "Moon", hint: "Honey" }, // Honeymoon
    { secretWord: "Coffee", hint: "Break" }, // Coffee break
    { secretWord: "Hammer", hint: "Time" }, // "Stop, Hammer time!"
    { secretWord: "Cloud", hint: "Storage" }, // Cloud storage
    { secretWord: "Mouse", hint: "Pad" }, // Mouse pad
    { secretWord: "Bridge", hint: "Holiday" }, // A long weekend
    { secretWord: "Bank", hint: "River" }, // River bank
    { secretWord: "Net", hint: "Work" }, // Network
    { secretWord: "Sheet", hint: "Music" }, // Music sheet
    { secretWord: "Star", hint: "Fish" }, // Starfish
    { secretWord: "Orange", hint: "Agent" }, // Agent Orange
];

const ALL_WORDS: Record<Language, GameWord[]> = {
  es: GAME_WORDS_ES,
  en: GAME_WORDS_EN,
  de: [], // German words need to be added
  fr: [], // French words need to be added
  it: [], // Italian words need to be added
  ja: [], // Japanese words need to be added
  pt: [], // Portuguese words need to be added
  ru: [], // Russian words need to be added
};

export function getAvailableWords(usedWords: string[], lang: Language): GameWord[] {
  const wordList = ALL_WORDS[lang] || ALL_WORDS['en'];
  // If a language has no specific words, fall back to English
  const effectiveWordList = wordList.length > 0 ? wordList : ALL_WORDS['en'];

  const available = effectiveWordList.filter(word => !usedWords.includes(word.secretWord));
  if (available.length === 0) {
    // If all words have been used, reset the list.
    return effectiveWordList;
  }
  return available;
}

export function getRandomWordAndHint(usedWords: string[], lang: Language): GameWord {
  const availableWords = getAvailableWords(usedWords, lang);
  if (availableWords.length === 0) {
    // This should not happen if getAvailableWords resets, but it's a safeguard.
    const fallbackWords = ALL_WORDS['en'];
    const randomIndex = Math.floor(Math.random() * fallbackWords.length);
    return fallbackWords[randomIndex];
  }
  const randomIndex = Math.floor(Math.random() * availableWords.length);
  return availableWords[randomIndex];
}
