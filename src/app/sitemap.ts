import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { getAllListings } from "@/lib/data/listings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const listings = await getAllListings();
  const alt = (path: string) => ({
    languages: Object.fromEntries(locales.map((l) => [l, `${site}/${l}${path}`])),
  });

  const pages = ["", "/properties", ...listings.map((l) => `/properties/${l.slug}`)];
  return pages.map((path) => ({
    url: `${site}/en${path}`,
    alternates: alt(path),
  }));
}
