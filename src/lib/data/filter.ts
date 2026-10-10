import type { Listing, ListingFilters, PropertyType } from "./types";

const TYPES = new Set<PropertyType>(["apartment", "villa", "townhouse", "penthouse", "office", "retail", "plot"]);

/** Reads search filters from URL params. Unknown values are ignored. */
export function parseFilters(get: (key: string) => string | null | undefined): ListingFilters {
  const one = (k: string) => get(k) || undefined;
  const num = (k: string) => {
    const raw = one(k);
    const v = Number(raw);
    return raw !== undefined && Number.isFinite(v) ? v : undefined;
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

export function filterListings(listings: Listing[], f: ListingFilters) {
  const q = f.q?.trim().toLowerCase();
  return listings.filter((l) => {
    if (f.purpose && l.purpose !== f.purpose) return false;
    if (f.market && l.market !== f.market) return false;
    if (f.type && l.type !== f.type) return false;
    if (f.beds !== undefined && (l.beds ?? -1) < f.beds) return false;
    if (f.maxPrice && l.priceAed > f.maxPrice) return false;
    if (q) {
      const hay = [l.community.en, l.community.ar, l.community.ru, l.building ?? "", l.title.en, l.title.ar, l.title.ru]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
