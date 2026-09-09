"use client";

import { createContext, useContext } from "react";

const LanguageContext = createContext(null);

export const languages = [
  { code: "ar", label: "العربية", short: "ع", dir: "rtl" },
  { code: "en", label: "English", short: "EN", dir: "ltr" },
  { code: "fa", label: "فارسی", short: "فا", dir: "rtl" },
];

export function LanguageProvider({ children }) {
  return <LanguageContext.Provider value={{ language: "ar", direction: "rtl" }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
