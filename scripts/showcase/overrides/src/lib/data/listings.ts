// Showcase build only: listings always come from the sample data.
import { sampleListings } from "@/lib/data/sample";

export async function getAllListings() {
  return sampleListings;
}

export async function getFeaturedListings(limit = 4) {
  const featured = sampleListings.filter((l) => l.featured);
  return (featured.length ? featured : sampleListings).slice(0, limit);
}

export async function getListingBySlug(slug: string) {
  return sampleListings.find((l) => l.slug === slug) ?? null;
}
