import { intlLocale, type Locale } from "@/i18n/config";

/** Replaces {key} placeholders in a dictionary string. */
export const t = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));

export const formatNumber = (n: number, locale: Locale) =>
  new Intl.NumberFormat(intlLocale[locale]).format(n);

export const formatAed = (n: number, locale: Locale) =>
  `AED ${formatNumber(n, locale)}`;

export const GTG_PHONE_DISPLAY = "00971 56 652 7700";
export const GTG_PHONE_TEL = "+971566527700";
export const GTG_WHATSAPP = "https://wa.me/971566527700";
export const GTG_EMAIL = "gtg.realestate.ae@gmail.com";

/** Set when the site is served from a sub-path (GitHub Pages: /gtg-realstate). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
