"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeLabel, locales, type Locale } from "@/i18n/config";

export function LanguageSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname() ?? `/${current}`;
  const rest = pathname.replace(/^\/(en|ar|ru)(?=\/|$)/, "");

  return (
    <div role="group" aria-label={label} className="flex overflow-hidden rounded-md border border-line">
      {locales.map((l) => {
        const active = l === current;
        return (
          <Link
            key={l}
            href={`/${l}${rest}`}
            hrefLang={l}
            aria-current={active ? "true" : undefined}
            onClick={() => {
              document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000; samesite=lax`;
            }}
            className={`inline-flex min-h-11 min-w-11 items-center justify-center text-[13px] font-bold ${
              active ? "bg-gold text-ink" : "text-sand-2 hover:text-gold-light"
            }`}
          >
            {localeLabel[l]}
          </Link>
        );
      })}
    </div>
  );
}
