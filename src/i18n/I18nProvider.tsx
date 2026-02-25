import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { I18nContext } from "./context";
import {
  LANGUAGE_STORAGE_KEY,
  languageLabels,
  translations,
  type AppLanguage,
} from "./translations";

type TranslateParams = Record<string, string | number>;

function replaceParams(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function getInitialLanguage(): AppLanguage {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === "en" || stored === "es" || stored === "it") return stored;
  return "en";
}

export default function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(getInitialLanguage);

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }, []);

  const t = useCallback(
    (key: string, params?: TranslateParams) => {
      const translated = translations[language][key] ?? key;
      return replaceParams(translated, params);
    },
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      languageLabels,
    }),
    [language, setLanguage, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
