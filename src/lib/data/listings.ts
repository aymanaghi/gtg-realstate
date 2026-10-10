import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/server";
import { sampleListings } from "./sample";
import type { Listing, ListingFilters, Localized, PropertyType } from "./types";

type PublicListingRow = {
  id: string;
  slug: string;
  ref_no: string;
  purpose: "sale" | "rent";
  market: "ready" | "off_plan";
  property_type: PropertyType;
  title: Partial<Localized> | null;
  description: Partial<Localized> | null;
  community: Partial<Localized> | null;
  building: string | null;
  emirate: string;
  price_aed: number;
  beds: number | null;
  baths: number | null;
  size_sqft: number | null;
  permit_no: string;
  permit_expiry: string;
  featured: boolean;
  media: { url: string; alt?: string }[] | null;
  agent: Listing["agent"];
};

const loc = (v: Partial<Localized> | null): Localized => ({
  en: v?.en ?? "",
  ar: v?.ar || v?.en || "",
  ru: v?.ru || v?.en || "",
});

const toListing = (r: PublicListingRow): Listing => ({
  id: r.id,
  slug: r.slug,
  ref: r.ref_no,
  purpose: r.purpose,
  market: r.market,
  type: r.property_type,
  title: loc(r.title),
  description: loc(r.description),
  community: loc(r.community),
  building: r.building,
  emirate: r.emirate,
  priceAed: Number(r.price_aed),
  beds: r.beds,
  baths: r.baths,
  sizeSqft: r.size_sqft,
  permitNo: r.permit_no,
  permitExpiry: r.permit_expiry,
  featured: r.featured,
  images: r.media ?? [],
  agent: r.agent,
});

/** Every live, permitted listing. Cached for a few minutes; the CRM revalidates the tag on publish. */
export async function getAllListings(): Promise<Listing[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("listings");

  if (!isSupabaseConfigured) return sampleListings;

  const { data, error } = await createPublicClient()
    .from("public_listings")
    .select("*")
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[listings] Supabase read failed", error.message);
    return [];
  }
  return (data as PublicListingRow[]).map(toListing);
}

export async function getFeaturedListings(limit = 4) {
  const all = await getAllListings();
  const featured = all.filter((l) => l.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

export async function getListingBySlug(slug: string) {
  const all = await getAllListings();
  return all.find((l) => l.slug === slug) ?? null;
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
      const hay = [l.community.en, l.community.ar, l.community.ru, l.building ?? "", l.title.en]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
