"use client";

import { useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { filterListings, parseFilters } from "@/lib/data/filter";
import type { Listing } from "@/lib/data/types";
import { formatNumber, t } from "@/lib/format";
import { ListingCard } from "./listing-card";
import { SearchForm } from "./search-form";

/** Filters in the browser, so it works on a static host (GitHub Pages) as well as a server. */
export function PropertyResults({ listings, lang, dict }: { listings: Listing[]; lang: Locale; dict: Dictionary }) {
  const params = useSearchParams();
  const filters = parseFilters((k) => params.get(k));
  const results = filterListings(listings, filters);

  return (
    <>
      {/* key resets the uncontrolled fields when the URL changes */}
      <SearchForm key={params.toString()} lang={lang} dict={dict} defaults={filters} />
      <p className="text-sm text-muted" aria-live="polite">
        {results.length === 1
          ? dict.listings.resultOne
          : t(dict.listings.results, { count: formatNumber(results.length, lang) })}
      </p>
      {results.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {results.map((l) => (
            <ListingCard key={l.id} listing={l} lang={lang} dict={dict} />
          ))}
        </div>
      ) : (
        <p className="max-w-xl rounded-xl border border-line bg-panel p-6 text-sand-2">{dict.listings.none}</p>
      )}
    </>
  );
}
