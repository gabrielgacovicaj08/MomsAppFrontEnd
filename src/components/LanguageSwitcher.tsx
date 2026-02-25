import useI18n from "../i18n/useI18n";
import type { AppLanguage } from "../i18n/translations";

export default function LanguageSwitcher() {
  const { language, setLanguage, t, languageLabels } = useI18n();

  return (
    <div className="mb-4 flex justify-end">
      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
        {t("Language")}
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value as AppLanguage)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        >
          {Object.keys(languageLabels).map((lang) => (
            <option key={lang} value={lang}>
              {languageLabels[lang as AppLanguage]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
