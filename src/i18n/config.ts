export const locales = ["en", "ar", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const localeDir = (locale: Locale): "rtl" | "ltr" =>
  locale === "ar" ? "rtl" : "ltr";

/** Intl tag used for numbers and dates. Arabic keeps Latin digits for prices. */
export const intlLocale: Record<Locale, string> = {
  en: "en-AE",
  ar: "ar-AE-u-nu-latn",
  ru: "ru-RU",
};

export const localeLabel: Record<Locale, string> = {
  en: "EN",
  ar: "AR",
  ru: "RU",
};
