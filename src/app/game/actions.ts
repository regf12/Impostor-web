import type { GameWord } from "@/lib/game-words";
import { getRandomWordAndHint as getWordFromLocalList } from "@/lib/game-words";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Language } from "@/lib/i18n";

async function getWordFromAI(usedWords: string[], lang: Language): Promise<GameWord> {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "YOUR_API_KEY_HERE" || apiKey === "PEGA_TU_CLAVE_DE_API_AQUÍ") {
        console.warn("API Key for Gemini not found, falling back to local word list.");
        return getWordFromLocalList(usedWords, lang);
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

    const usedWordsString = usedWords.length > 0 ? usedWords.join(", ") : "none";

    const languageMap: Record<Language, string> = {
        en: "English",
        es: "Spanish",
        de: "German",
        fr: "French",
        it: "Italian",
        ja: "Japanese",
        pt: "Portuguese",
        ru: "Russian",
    }
    const languageName = languageMap[lang] || "English";


    const prompt = `
        You are a word generator for a bluffing game like "Impostor".
        Your task is to generate a secret word (secretWord) and a hint (hint) for that word in the language "${languageName}".
        The hint must be clever, a single word, and not obvious, creating a double meaning or an unexpected connection.
        Example in English: For "Banana", a hint could be "Pajama". For "Car", the hint could be "Jack".
        Example in Spanish: para "Plátano", una pista podría ser "Pijama". Para "Coche", la pista podría ser "Gato".

        The secret word must be a common, singular noun, and easy to understand in "${languageName}".
        DO NOT use any of the following words which have already been used: ${usedWordsString}.
        
        Respond ONLY with a valid JSON object in the following format, with no additional text or explanations:
        {
          "secretWord": "word",
          "hint": "hint"
        }
    `;
    
    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        
        // Clean and parse the JSON response
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(jsonString) as GameWord;

        if (parsed.secretWord && parsed.hint) {
            return parsed;
        }

        throw new Error("AI response in incorrect format.");

    } catch (error) {
        console.error("Error calling Gemini API, using local list:", error);
        return getWordFromLocalList(usedWords, lang);
    }
}


export async function getWordAndHintAction(usedWords: string[], lang: Language): Promise<GameWord> {
  // Always try the AI first, passing the used words list to avoid repeats.
  return getWordFromAI(usedWords, lang);
}
