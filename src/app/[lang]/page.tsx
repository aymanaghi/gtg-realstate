import Image from "next/image";
import founderPhoto from "@/assets/founder-nabeel.jpg";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getFeaturedListings } from "@/lib/data/listings";
import { GTG_EMAIL, GTG_PHONE_DISPLAY, GTG_PHONE_TEL } from "@/lib/format";
import { ContactForm } from "@/components/site/contact-form";
import { GoldRule } from "@/components/site/gold-rule";
import { ListingCard } from "@/components/site/listing-card";
import { SearchForm } from "@/components/site/search-form";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const featured = await getFeaturedListings(4);

  return (
    <>
      {/* Hero */}
      <section className="bg-ink px-6 pt-18 pb-16">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <p className="tracking-caps font-caps text-sm font-semibold uppercase text-gold">{dict.hero.eyebrow}</p>
            <h1 className="font-display text-5xl leading-[1.05] font-extrabold text-white md:text-[68px]">
              {dict.hero.title}
            </h1>
            <GoldRule />
            <p className="max-w-xl text-lg leading-relaxed text-[#CFC6B8]">{dict.hero.body}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${lang}/properties`}
                className="inline-flex min-h-13 items-center rounded-md bg-gold px-7 text-[15px] font-bold text-ink hover:bg-gold-light"
              >
                {dict.hero.ctaProperties}
              </Link>
              <Link
                href={`/${lang}#contact`}
                className="inline-flex min-h-13 items-center rounded-md border border-[#6B5C47] px-7 text-[15px] font-semibold text-sand hover:border-gold"
              >
                {dict.hero.ctaConsult}
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border-2 border-gold">
            <Image
              src={founderPhoto}
              alt={dict.hero.photoAlt}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="block h-auto w-full"
            />
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-7xl">
          <SearchForm lang={lang} dict={dict} />
        </div>
      </section>

      {/* Services */}
      <section id="services" className="scroll-mt-6 bg-cream px-6 py-20 text-ink">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-4xl font-extrabold md:text-[44px]">{dict.services.title}</h2>
          <GoldRule className="mt-4.5 mb-12 w-54" />
          <div className="grid gap-x-16 md:grid-cols-2">
            {dict.services.items.map((s, i) => (
              <article key={s.title} className="flex gap-7 border-b border-[#D6D1C4] py-7">
                <span className="min-w-8 font-display text-lg font-bold text-gold-deep">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-2.5">
                  <h3 className="font-display text-[21px] font-bold">{s.title}</h3>
                  <p className="text-[15px] leading-relaxed text-body-dark">{s.body}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-12 rounded-xl bg-ink px-10 py-9 text-sand">
            <h3 className="mb-3 font-display text-[28px] font-semibold text-gold">{dict.services.approachTitle}</h3>
            <p className="text-[17px] leading-relaxed">{dict.services.approachBody}</p>
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="bg-ink px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="tracking-caps mb-2.5 font-caps text-sm font-semibold uppercase text-gold">{dict.listings.eyebrow}</p>
              <h2 className="font-display text-4xl font-extrabold text-white md:text-[44px]">{dict.listings.featured}</h2>
            </div>
            <Link href={`/${lang}/properties`} className="py-3 text-[15px] font-semibold text-gold hover:text-gold-light">
              {dict.listings.viewAll} <span aria-hidden="true" className="inline-block rtl:rotate-180">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} lang={lang} dict={dict} />
            ))}
          </div>
        </div>
      </section>

      {/* Personal message */}
      <section id="founder" className="scroll-mt-6 border-y border-line-soft bg-ink-deep px-6 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div className="flex flex-col gap-5.5">
            <h2 className="tracking-caps font-caps text-3xl font-semibold uppercase text-gold md:text-[40px]">{dict.founder.title}</h2>
            <GoldRule className="w-75 max-w-full" />
            <p className="text-lg leading-[1.75] text-sand-2">{dict.founder.body}</p>
            <p className="mt-2 font-script text-[52px] leading-none text-gold">{dict.founder.name}</p>
            <p className="tracking-caps font-caps text-[15px] leading-[1.7] font-semibold uppercase text-sand-2">
              {dict.founder.role}
              <br />
              {dict.founder.company}
            </p>
          </div>
          <figure className="flex flex-col items-center gap-3.5">
            <Image
              src={founderPhoto}
              alt={dict.founder.photoAlt}
              sizes="420px"
              className="aspect-[3/4] w-full max-w-[420px] rounded-xl border-2 border-gold object-cover object-[50%_30%]"
            />
            <figcaption className="text-center">
              <div className="font-display text-xl font-bold text-gold">{dict.founder.name}</div>
              <div className="text-sm text-muted">
                {dict.founder.role}, {dict.founder.company}
              </div>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-6 bg-ink px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 rounded-2xl border border-line bg-panel p-8 md:p-12 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-[34px] font-semibold text-gold">{dict.contact.title}</h2>
            <p className="text-base leading-relaxed text-sand-2">{dict.contact.body}</p>
            <a href={`tel:${GTG_PHONE_TEL}`} className="font-display text-[22px] font-bold text-gold hover:text-gold-light">
              {dict.contact.phoneLabel}: <span dir="ltr">{GTG_PHONE_DISPLAY}</span>
            </a>
            <a href={`mailto:${GTG_EMAIL}`} className="text-base text-sand underline decoration-gold underline-offset-4">
              {GTG_EMAIL}
            </a>
          </div>
          <ContactForm lang={lang} text={dict.contact} />
        </div>
        <p className="mt-16 text-center font-display text-3xl font-medium text-gold italic">{dict.tagline}</p>
      </section>
    </>
  );
}
