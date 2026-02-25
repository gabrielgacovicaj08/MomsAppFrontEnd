import { createContext } from "react";
import type { AppLanguage } from "./translations";

type TranslateParams = Record<string, string | number>;

export type I18nContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: string, params?: TranslateParams) => string;
  languageLabels: Record<AppLanguage, string>;
};

export const I18nContext = createContext<I18nContextValue | undefined>(undefined);
