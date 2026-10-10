import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Listing } from "@/lib/data/types";
import { formatAed, formatNumber, t } from "@/lib/format";

export function listingBadge(l: Listing, d: Dictionary["listings"]) {
  if (l.market === "off_plan") return d.offPlan;
  return l.purpose === "rent" ? d.forRent : d.forSale;
}

export function listingPrice(l: Listing, lang: Locale, d: Dictionary["listings"]) {
  const price = formatAed(l.priceAed, lang);
  if (l.purpose === "rent") return `${price} ${d.perYear}`;
  if (l.market === "off_plan") return `${d.from} ${price}`;
  return price;
}

export function bedsLabel(beds: number | null, lang: Locale, d: Dictionary["listings"]) {
  if (beds === null) return null;
  if (beds === 0) return d.studio;
  if (beds === 1) return d.bed;
  return t(d.beds, { n: formatNumber(beds, lang) });
}

export function ListingPhoto({ listing, label, className = "" }: { listing: Listing; label: string; className?: string }) {
  const img = listing.images[0];
  if (img) {
    return (
      <div className={`relative overflow-hidden bg-panel-2 ${className}`}>
        <Image src={img.url} alt={img.alt ?? listing.title.en} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
      </div>
    );
  }
  return (
    <div role="img" aria-label={label} className={`flex items-end bg-panel-2 p-4 ${className}`}>
      <span className="text-xs text-muted-2">{label}</span>
    </div>
  );
}

export function ListingCard({ listing, lang, dict }: { listing: Listing; lang: Locale; dict: Dictionary }) {
  const d = dict.listings;
  const facts = [
    bedsLabel(listing.beds, lang, d),
    listing.baths !== null ? t(d.baths, { n: formatNumber(listing.baths, lang) }) : null,
    listing.sizeSqft !== null ? t(d.sqft, { n: formatNumber(listing.sizeSqft, lang) }) : null,
  ].filter(Boolean);

  return (
    <Link
      href={`/${lang}/properties/${listing.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-panel text-sand no-underline transition-colors hover:border-gold"
    >
      <div className="relative">
        <ListingPhoto listing={listing} label={d.photoSoon} className="aspect-[4/3]" />
        <span className="absolute start-3 top-3 rounded bg-gold px-2.5 py-1.5 text-xs font-bold text-ink">
          {listingBadge(listing, d)}
        </span>
      </div>
      <div className="flex flex-col gap-2 p-5">
        <p className="font-display text-[23px] font-bold text-gold" dir="ltr" style={{ textAlign: "start" }}>
          {listingPrice(listing, lang, d)}
        </p>
        <p className="text-[15px] font-semibold">{listing.title[lang]}</p>
        <p className="text-sm text-muted">{listing.community[lang]}</p>
        <div className="flex flex-wrap gap-3.5 border-t border-line-soft pt-2.5 text-[13px] text-sand-2">
          {facts.map((f) => (
            <span key={f}>{f}</span>
          ))}
        </div>
        <p className="text-[11.5px] text-muted-2">{t(d.permit, { n: listing.permitNo })}</p>
      </div>
    </Link>
  );
}
