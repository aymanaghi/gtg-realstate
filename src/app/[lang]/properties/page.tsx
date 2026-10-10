import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";
import { filterListings, getAllListings } from "@/lib/data/listings";
import type { ListingFilters, PropertyType } from "@/lib/data/types";
import { formatNumber, t } from "@/lib/format";
import { GoldRule } from "@/components/site/gold-rule";
import { ListingCard } from "@/components/site/listing-card";
import { SearchForm } from "@/components/site/search-form";

const TYPES = new Set<PropertyType>(["apartment", "villa", "townhouse", "penthouse", "office", "retail", "plot"]);
type SP = Record<string, string | string[] | undefined>;

function parseFilters(sp: SP): ListingFilters {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k][0] : sp[k]) || undefined;
  const num = (k: string) => {
    const v = Number(one(k));
    return one(k) !== undefined && Number.isFinite(v) ? v : undefined;
  };
  const purpose = one("purpose");
  const type = one("type") as PropertyType | undefined;
  return {
    purpose: purpose === "sale" || purpose === "rent" ? purpose : undefined,
    market: one("market") === "off_plan" ? "off_plan" : undefined,
    type: type && TYPES.has(type) ? type : undefined,
    q: one("q")?.slice(0, 80),
    beds: num("beds"),
    maxPrice: num("maxPrice"),
  };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/properties">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.listings.allTitle, alternates: { canonical: `/${lang}/properties` } };
}

export default async function PropertiesPage({ params, searchParams }: PageProps<"/[lang]/properties">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <section className="px-6 py-14">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-white md:text-5xl">{dict.listings.allTitle}</h1>
          <GoldRule className="mt-4 w-54" />
        </div>
        <Suspense fallback={<p className="text-muted">{dict.listings.loading}</p>}>
          <Results lang={lang} dict={dict} searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}

async function Results({ lang, dict, searchParams }: { lang: Locale; dict: Dictionary; searchParams: Promise<SP> }) {
  const filters = parseFilters(await searchParams);
  const listings = filterListings(await getAllListings(), filters);

  return (
    <>
      <SearchForm lang={lang} dict={dict} defaults={filters} />
      <p className="text-sm text-muted" aria-live="polite">
        {listings.length === 1
          ? dict.listings.resultOne
          : t(dict.listings.results, { count: formatNumber(listings.length, lang) })}
      </p>
      {listings.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} lang={lang} dict={dict} />
          ))}
        </div>
      ) : (
        <p className="max-w-xl rounded-xl border border-line bg-panel p-6 text-sand-2">{dict.listings.none}</p>
      )}
    </>
  );
}
