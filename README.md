# GTG Real Estate — website + CRM

Website and CRM for **GTG Real Estate LLC**, a private real estate advisory in the UAE.
One Next.js app serves the public site (English, Arabic, Russian) and the staff CRM. Supabase is the backend.

## What's in this first version

**Website** (`/en`, `/ar`, `/ru` — Arabic is right-to-left)

- Home: hero, property search, the seven services, featured listings, the founder's personal message, contact form
- `/[lang]/properties`: search results with filters (buy/rent, off-plan, area, type, beds, price) in shareable URLs
- `/[lang]/properties/[slug]`: listing page with facts, DLD permit block, WhatsApp/call, enquiry form, mortgage estimate, `RealEstateListing` schema
- Enquiries are stored as CRM leads, with PDPL consent, UTM tags and the listing reference
- SEO: per-language metadata, `hreflang`, sitemap, robots (CRM excluded)

**CRM** (`/crm`, staff only)

- Email + password sign-in (Supabase Auth)
- Leads pipeline by stage, with a warning for new leads waiting over 15 minutes and a "Move to" control
- Listings table with DLD permit status (valid, expiring within 10 days, expired)

**Database** (`supabase/migrations`)

Profiles (staff roles), contacts, communities, buildings, listings with EN/AR/RU text, media, portal channels,
leads, activities, deals, commissions, tenancies, cheques, audit log — all with row-level security:

- A listing cannot be set live without a permit number and a future expiry date
- The public site reads only the `public_listings` view: live listings, valid permit, website channel on
- Visitors can only call `submit_enquiry()`; they cannot read any table
- Agents see only leads assigned to them; managers and admins see all; only admins change roles
- Every stage change is logged on the lead's timeline

## Brand

Black `#120E10`, gold `#C9A46A`, cream `#EFEDE6`, from the GTG brochure.
Fonts are self-hosted from npm: Playfair Display (headings), Cinzel (caps labels), Montserrat (body),
Great Vibes (signature), Noto Kufi Arabic and Noto Sans Arabic for Arabic.
Tokens live in `src/app/globals.css`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /en
```

With no `.env.local`, the site and CRM run in **demo mode** on sample listings and leads. Nothing is saved.

## Connect Supabase

1. Create a Supabase project (pick the region closest to the UAE).
2. Apply the schema: `supabase db push`, or paste `supabase/migrations/20261010000000_init.sql` into the SQL editor.
3. Copy `.env.example` to `.env.local` and fill in the project URL and anon key.
4. Create staff users under **Authentication → Users**. Each gets an inactive profile; activate the first admin in SQL:
   ```sql
   update profiles set active = true, role = 'admin', full_name = 'Nabeel Al Naghi' where id = '<user id>';
   ```
5. Schedule the daily permit check (Database → Extensions → enable `pg_cron`):
   ```sql
   select cron.schedule('expire-permits', '5 0 * * *', 'select expire_listing_permits()');
   ```

To show a listing on the site it needs `status = 'live'`, a permit, an English title in `listing_i18n`,
and a `listing_channels` row for `website`. Arabic and Russian text only shows once `approved = true`.

## Showcase on GitHub Pages

`.github/workflows/pages.yml` publishes a static demo on every push to `main`:
sample listings with photos, all three languages, and the CRM screens in demo mode.
GitHub Pages has no server, so in that build enquiries open WhatsApp instead of saving a lead,
CRM stage changes aren't saved, and there's no sign-in. The swaps live in `scripts/showcase/overrides`.

Build it locally:

```bash
PAGES_BASE_PATH=/gtg-realstate node scripts/showcase/build.mjs --restore   # output in ./out
```

Listing photos are placeholders from [Unsplash](https://unsplash.com/license) (free to use);
replace them with GTG's own photos of each unit.

## Deploy the full app

Vercel: import the repo, add the three env vars, deploy. Point the domain at Vercel.

## Still to do (next phases)

- CRM screens to add and edit listings, upload photos, assign leads, contacts, deals and commissions
- Property Finder, Bayut and Dubizzle XML feeds and lead imports
- WhatsApp Business API inbox and auto-replies
- Landlords, tenancies, cheques and renewal reminders
- AI drafts of Arabic and Russian listing text

## Content GTG still needs to send

- RERA ORN and trade licence numbers (footer placeholders)
- A high-resolution or vector logo (the current one is cropped from the brochure)
- Real listings, photos, agent names and BRN numbers
- A native-speaker review of the Arabic and Russian copy
