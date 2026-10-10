import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { GTG_PHONE_TEL } from "@/lib/format";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const nav = [
    { href: `/${lang}/properties?purpose=sale`, label: dict.nav.buy },
    { href: `/${lang}/properties?purpose=rent`, label: dict.nav.rent },
    { href: `/${lang}/properties?market=off_plan`, label: dict.nav.offPlan },
    { href: `/${lang}#services`, label: dict.nav.services },
    { href: `/${lang}#founder`, label: dict.nav.about },
    { href: `/${lang}#contact`, label: dict.nav.contact },
  ];

  return (
    <header className="border-b border-line-soft bg-ink">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-3.5">
        <Link href={`/${lang}`} className="flex items-center gap-3.5 text-sand no-underline">
          <Image
            src="/images/gtg-logo.jpg"
            alt="GTG Real Estate"
            width={150}
            height={141}
            priority
            className="h-[68px] w-[72px] rounded object-contain"
          />
          <span className="font-display text-xl font-bold tracking-wide">GTG REAL ESTATE</span>
        </Link>

        <nav aria-label={dict.nav.main} className="flex flex-wrap gap-0.5">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="tracking-caps px-3.5 py-3 font-caps text-sm font-semibold uppercase text-sand-2 hover:text-gold-light"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher current={lang} label={dict.nav.language} />
          <a
            href={`tel:${GTG_PHONE_TEL}`}
            dir="ltr"
            className="inline-flex min-h-11 items-center rounded-md border border-gold px-4 text-sm font-semibold text-gold hover:text-gold-light"
          >
            +971 56 652 7700
          </a>
        </div>
      </div>
    </header>
  );
}
