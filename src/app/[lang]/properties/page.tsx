import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getAllListings } from "@/lib/data/listings";
import { GoldRule } from "@/components/site/gold-rule";
import { PropertyResults } from "@/components/site/property-results";

export async function generateMetadata({ params }: PageProps<"/[lang]/properties">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.listings.allTitle, alternates: { canonical: `/${lang}/properties` } };
}

export default async function PropertiesPage({ params }: PageProps<"/[lang]/properties">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, listings] = await Promise.all([getDictionary(lang), getAllListings()]);

  return (
    <section className="px-6 py-14">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-white md:text-5xl">{dict.listings.allTitle}</h1>
          <GoldRule className="mt-4 w-54" />
        </div>
        <Suspense fallback={<p className="text-muted">{dict.listings.loading}</p>}>
          <PropertyResults listings={listings} lang={lang} dict={dict} />
        </Suspense>
      </div>
    </section>
  );
}
