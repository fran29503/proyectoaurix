"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { en, type Translations } from "./translations/en";
import { es } from "./translations/es";
import { ar } from "./translations/ar";

export type Language = "en" | "es" | "ar";

const translations: Record<Language, Translations> = { en, es, ar };

export const languages = [
  { code: "en" as const, label: "English", flag: "🇺🇸", dir: "ltr" as const },
  { code: "es" as const, label: "Español", flag: "🇪🇸", dir: "ltr" as const },
  { code: "ar" as const, label: "العربية", flag: "🇦🇪", dir: "rtl" as const },
];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = "aurix-language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Load saved language on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved && translations[saved]) {
      setLanguageState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<LanguageContextType>(() => ({
    language,
    setLanguage,
    t: translations[language],
    isRTL: language === "ar",
  }), [language, setLanguage]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Alias for convenience
export const useTranslations = () => useLanguage().t;
