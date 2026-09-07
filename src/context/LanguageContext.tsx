import React, { createContext, useContext, useEffect } from "react";
import { Language, t, TranslationKey } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: "rtl" | "ltr";
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language: Language = "ar";
  const dir = "rtl";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.documentElement.classList.add("rtl");
    document.documentElement.classList.remove("ltr");
  }, []);

  const setLanguage = (_lang: Language) => {
    // No-op as we only support Arabic now
  };

  const translate = (key: TranslationKey) => t(key, language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, t: translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
