import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, getBrowserLanguage, TranslationKey, t } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translate: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  // Initialize language based on browser settings
  useEffect(() => {
    const browserLanguage = getBrowserLanguage();
    setLanguage(browserLanguage);
  }, []);

  // Translation function that uses the current language
  const translate = (key: TranslationKey) => {
    return t(key, language);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}