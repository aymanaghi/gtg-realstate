import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, intlLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getAllListings, getListingBySlug } from "@/lib/data/listings";
import { GTG_PHONE_DISPLAY, GTG_PHONE_TEL, GTG_WHATSAPP, formatNumber, t } from "@/lib/format";
import { ContactForm } from "@/components/site/contact-form";
import { GoldRule } from "@/components/site/gold-rule";
import { ListingPhoto, bedsLabel, listingBadge, listingPrice } from "@/components/site/listing-card";
import { MortgageCalculator } from "@/components/site/mortgage-calculator";

export async function generateStaticParams() {
  const listings = await getAllListings();
  return locales.flatMap((lang) => listings.map((l) => ({ lang, slug: l.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/properties/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const listing = await getListingBySlug(slug);
  if (!listing) return {};
  return {
    title: listing.title[lang],
    description: `${listing.title[lang]} — ${listing.community[lang]}`,
    alternates: {
      canonical: `/${lang}/properties/${slug}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/properties/${slug}`])),
    },
  };
}

export default async function PropertyPage({ params }: PageProps<"/[lang]/properties/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, listing] = await Promise.all([getDictionary(lang), getListingBySlug(slug)]);
  if (!listing) notFound();

  const d = dict.listings;
  const p = dict.property;
  const facts = [
    { k: p.bedrooms, v: bedsLabel(listing.beds, lang, d) },
    { k: p.bathrooms, v: listing.baths !== null ? formatNumber(listing.baths, lang) : null },
    { k: p.size, v: listing.sizeSqft !== null ? t(d.sqft, { n: formatNumber(listing.sizeSqft, lang) }) : null },
    { k: p.type, v: dict.search.types[listing.type] },
  ].filter((f) => f.v);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title[lang],
    description: listing.description[lang],
    url: `/${lang}/properties/${listing.slug}`,
    offers: { "@type": "Offer", price: listing.priceAed, priceCurrency: "AED" },
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label={p.breadcrumb} className="pt-2 pb-5 text-sm text-muted">
        <Link href={`/${lang}`} className="text-gold hover:text-gold-light">{p.home}</Link>
        {" / "}
        <Link href={`/${lang}/properties`} className="text-gold hover:text-gold-light">{d.allTitle}</Link>
        {" / "}
        <span>{listing.community[lang]}</span>
      </nav>

      <div className="grid gap-3 md:grid-cols-3">
        <ListingPhoto listing={listing} label={d.photoSoon} className="min-h-[300px] rounded-xl md:col-span-2 md:min-h-[440px]" />
        <div className="grid gap-3 md:grid-rows-2">
          {listing.images.slice(1, 3).map((img) => (
            <div key={img.url} className="relative min-h-[214px] overflow-hidden rounded-xl bg-panel-2">
              <Image src={img.url} alt={img.alt ?? listing.title[lang]} fill sizes="33vw" className="object-cover" />
            </div>
          ))}
          {listing.images.length < 2 && (
            <div className="hidden min-h-[214px] rounded-xl bg-panel-2 md:row-span-2 md:block" aria-hidden="true" />
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-10 pt-10">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-9">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="rounded bg-gold px-2.5 py-1.5 text-xs font-bold text-ink">{listingBadge(listing, d)}</span>
            </div>
            <h1 className="font-display text-4xl leading-tight font-extrabold text-white md:text-[42px]">{listing.title[lang]}</h1>
            <p className="text-base text-muted">
              {[listing.building, listing.community[lang], listing.emirate].filter(Boolean).join(", ")}
            </p>
            <GoldRule className="mt-1.5 w-54" />
            <p className="mt-1.5 font-display text-[38px] font-bold text-gold" dir="ltr" style={{ textAlign: "start" }}>
              {listingPrice(listing, lang, d)}
            </p>
          </div>

          <dl className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
            {facts.map((f) => (
              <div key={f.k} className="rounded-lg border border-line bg-panel p-4">
                <dt className="tracking-caps font-caps text-xs font-semibold uppercase text-gold">{f.k}</dt>
                <dd className="font-display text-2xl font-bold">{f.v}</dd>
              </div>
            ))}
          </dl>

          <section className="flex flex-col gap-3">
            <h2 className="font-display text-[26px] font-bold text-white">{p.about}</h2>
            <p className="text-base leading-[1.75] whitespace-pre-line text-[#CFC6B8]">{listing.description[lang]}</p>
          </section>

          {listing.purpose === "sale" && (
            <MortgageCalculator price={listing.priceAed} intl={intlLocale[lang]} text={p} />
          )}
        </div>

        <aside className="flex min-w-0 flex-[1_1_340px] flex-col gap-4">
          <div className="flex flex-col gap-3.5 rounded-2xl border border-line bg-panel p-6">
            <h2 className="font-display text-xl font-bold">{p.enquire}</h2>
            {listing.agent && (
              <div className="text-sm">
                <div className="font-display text-[17px] font-bold">{listing.agent.name}</div>
                <div className="text-muted">
                  {listing.agent.brn ? `BRN ${listing.agent.brn} · ` : ""}
                  {t(p.agentLangs, { langs: listing.agent.languages.join(", ") })}
                </div>
              </div>
            )}
            <a
              href={`${GTG_WHATSAPP}?text=${encodeURIComponent(`${listing.ref} — ${listing.title.en}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center rounded-md bg-gold text-[15px] font-bold text-ink hover:bg-gold-light"
            >
              {p.whatsapp}
            </a>
            <a
              href={`tel:${listing.agent?.phone ?? GTG_PHONE_TEL}`}
              className="flex min-h-12 items-center justify-center rounded-md border border-[#6B5C47] text-[15px] font-semibold text-sand hover:border-gold"
            >
              {p.call} <span dir="ltr" className="ms-1">{GTG_PHONE_DISPLAY}</span>
            </a>
            <div className="h-px bg-line" />
            <ContactForm lang={lang} text={dict.contact} listingRef={listing.ref} showMessage />
          </div>

          <div className="flex flex-col gap-1 rounded-2xl border border-line bg-panel p-5 text-[13px] text-[#CFC6B8]">
            <strong className="text-sm text-sand">{p.permitTitle}</strong>
            <span>{t(p.permitNo, { n: listing.permitNo })}</span>
            <span>{t(p.ref, { n: listing.ref })}</span>
            <span className="text-muted-2">{p.permitHelp}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
