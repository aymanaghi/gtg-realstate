-- GTG Real Estate: core schema for the website and CRM.
-- Run with `supabase db push` (or paste into the Supabase SQL editor).


-- ───────────────────────── Enums ─────────────────────────
create type staff_role      as enum ('admin', 'manager', 'agent', 'back_office');
create type listing_purpose as enum ('sale', 'rent');
create type listing_market  as enum ('ready', 'off_plan');
create type property_type   as enum ('apartment', 'villa', 'townhouse', 'penthouse', 'office', 'retail', 'plot');
create type listing_status  as enum ('draft', 'pending_permit', 'live', 'under_offer', 'sold', 'rented', 'archived');
create type lead_stage      as enum ('new', 'contacted', 'qualified', 'viewing', 'offer', 'closed_won', 'closed_lost');
create type lead_source     as enum ('website', 'whatsapp', 'property_finder', 'bayut', 'dubizzle', 'meta_ads', 'google_ads', 'walk_in', 'referral', 'manual');
create type activity_type   as enum ('call', 'whatsapp', 'email', 'note', 'viewing', 'task', 'stage_change');
create type deal_type       as enum ('sale', 'rent');
create type commission_status as enum ('expected', 'invoiced', 'received', 'paid_out');
create type channel         as enum ('website', 'property_finder', 'bayut', 'dubizzle');

-- ───────────────────────── Helpers ─────────────────────────
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ───────────────────────── Staff ─────────────────────────
create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  role        staff_role not null default 'agent',
  brn         text,                       -- RERA broker registration number
  phone       text,
  languages   text[] not null default '{}',
  photo_url   text,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function current_role_is(roles staff_role[]) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.active and p.role = any (roles)
  );
$$;

create or replace function current_staff_role() returns staff_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select current_role_is(array['admin','manager','agent','back_office']::staff_role[]);
$$;

create or replace function is_manager() returns boolean
language sql stable security definer set search_path = public as $$
  select current_role_is(array['admin','manager']::staff_role[]);
$$;

-- ───────────────────────── Contacts ─────────────────────────
create table contacts (
  id                 uuid primary key default gen_random_uuid(),
  full_name          text not null,
  phone              text not null unique,          -- E.164
  email              text,
  nationality        text,
  preferred_language text not null default 'en',
  kinds              text[] not null default '{}',   -- buyer, tenant, landlord, seller, investor
  consent_at         timestamptz,                    -- UAE PDPL marketing consent
  notes              text,
  created_by         uuid references profiles (id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index contacts_email_idx on contacts (lower(email));

-- ───────────────────────── Locations ─────────────────────────
create table communities (
  id       uuid primary key default gen_random_uuid(),
  slug     text not null unique,
  emirate  text not null default 'Dubai',
  name_en  text not null,
  name_ar  text,
  name_ru  text
);

create table buildings (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references communities (id),
  name          text not null
);

-- ───────────────────────── Listings ─────────────────────────
create table listings (
  id             uuid primary key default gen_random_uuid(),
  ref_no         text not null unique,
  slug           text not null unique,
  purpose        listing_purpose not null,
  market         listing_market not null default 'ready',
  property_type  property_type not null,
  status         listing_status not null default 'draft',
  community_id   uuid references communities (id),
  building_id    uuid references buildings (id),
  unit_no        text,
  emirate        text not null default 'Dubai',
  price_aed      numeric(14, 2) not null check (price_aed > 0),
  beds           smallint check (beds >= 0),        -- 0 = studio, null = n/a
  baths          smallint check (baths >= 0),
  size_sqft      integer check (size_sqft > 0),
  permit_no      text,                               -- Trakheesi (Dubai) / Madhmoun (Abu Dhabi)
  permit_expiry  date,
  featured       boolean not null default false,
  owner_id       uuid references contacts (id),
  agent_id       uuid references profiles (id),
  published_at   timestamptz,
  created_by     uuid references profiles (id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index listings_live_idx on listings (status, permit_expiry);

-- Publish gate: no listing goes live without a valid advertising permit.
create or replace function enforce_listing_permit() returns trigger
language plpgsql as $$
begin
  if new.status = 'live' then
    if new.permit_no is null or new.permit_expiry is null or new.permit_expiry < current_date then
      raise exception 'A listing needs a valid DLD permit number and expiry date before it can go live';
    end if;
    if new.published_at is null then new.published_at := now(); end if;
  end if;
  return new;
end $$;

create trigger listings_permit_gate before insert or update on listings
  for each row execute function enforce_listing_permit();

create table listing_i18n (
  listing_id   uuid not null references listings (id) on delete cascade,
  lang         text not null check (lang in ('en', 'ar', 'ru')),
  title        text not null,
  description  text,
  approved     boolean not null default false,  -- AI drafts stay false until an agent approves
  primary key (listing_id, lang)
);

create table listing_media (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references listings (id) on delete cascade,
  url         text not null,
  kind        text not null default 'photo' check (kind in ('photo', 'video', 'floorplan', 'tour')),
  alt         text,
  sort        smallint not null default 0
);

create table listing_channels (
  listing_id      uuid not null references listings (id) on delete cascade,
  channel         channel not null,
  enabled         boolean not null default true,
  external_id     text,
  last_synced_at  timestamptz,
  primary key (listing_id, channel)
);

-- ───────────────────────── Leads ─────────────────────────
create table leads (
  id               uuid primary key default gen_random_uuid(),
  contact_id       uuid not null references contacts (id),
  listing_id       uuid references listings (id),
  source           lead_source not null,
  stage            lead_stage not null default 'new',
  interest         text,
  budget_text      text,
  requirements     jsonb not null default '{}',
  utm              jsonb not null default '{}',
  source_url       text,
  assigned_to      uuid references profiles (id),
  last_contact_at  timestamptz,
  lost_reason      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index leads_stage_idx on leads (stage, created_at desc);
create index leads_assigned_idx on leads (assigned_to);

create table activities (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references leads (id) on delete cascade,
  contact_id  uuid references contacts (id) on delete cascade,
  type        activity_type not null,
  body        text,
  due_at      timestamptz,
  done        boolean not null default false,
  created_by  uuid references profiles (id) default auth.uid(),
  created_at  timestamptz not null default now()
);

-- Log every stage change on the lead's timeline.
create or replace function log_lead_stage_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.stage is distinct from old.stage then
    insert into activities (lead_id, contact_id, type, body, done, created_by)
    values (new.id, new.contact_id, 'stage_change', old.stage::text || ' → ' || new.stage::text, true, auth.uid());
  end if;
  return new;
end $$;

create trigger leads_stage_log after update of stage on leads
  for each row execute function log_lead_stage_change();

-- ───────────────────────── Deals and commissions ─────────────────────────
create table deals (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references leads (id),
  listing_id  uuid references listings (id),
  type        deal_type not null,
  price_aed   numeric(14, 2) not null,
  closed_at   date,
  created_at  timestamptz not null default now()
);

create table commissions (
  id          uuid primary key default gen_random_uuid(),
  deal_id     uuid not null references deals (id) on delete cascade,
  gross_aed   numeric(14, 2) not null,
  -- [{ "party": "agency" | "listing_agent" | "buyer_agent" | "external", "profile_id": "...", "pct": 50 }]
  splits      jsonb not null default '[]',
  status      commission_status not null default 'expected',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ───────────────────────── Leasing ─────────────────────────
create table tenancies (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid references listings (id),
  landlord_id   uuid not null references contacts (id),
  tenant_id     uuid not null references contacts (id),
  annual_rent   numeric(14, 2) not null,
  deposit_aed   numeric(14, 2),
  start_date    date not null,
  end_date      date not null check (end_date > start_date),
  ejari_no      text,
  managed       boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table tenancy_cheques (
  id           uuid primary key default gen_random_uuid(),
  tenancy_id   uuid not null references tenancies (id) on delete cascade,
  due_date     date not null,
  amount_aed   numeric(14, 2) not null,
  cheque_no    text,
  status       text not null default 'pending' check (status in ('pending', 'deposited', 'cleared', 'bounced'))
);

-- ───────────────────────── Audit ─────────────────────────
create table audit_log (
  id         bigint generated always as identity primary key,
  entity     text not null,
  entity_id  uuid,
  action     text not null,
  diff       jsonb,
  actor      uuid default auth.uid(),
  at         timestamptz not null default now()
);

-- updated_at triggers
create trigger profiles_updated    before update on profiles    for each row execute function set_updated_at();
create trigger contacts_updated    before update on contacts    for each row execute function set_updated_at();
create trigger listings_updated    before update on listings    for each row execute function set_updated_at();
create trigger leads_updated       before update on leads       for each row execute function set_updated_at();
create trigger commissions_updated before update on commissions for each row execute function set_updated_at();
create trigger tenancies_updated   before update on tenancies   for each row execute function set_updated_at();

-- ───────────────────────── Row-level security ─────────────────────────
alter table profiles          enable row level security;
alter table contacts          enable row level security;
alter table communities       enable row level security;
alter table buildings         enable row level security;
alter table listings          enable row level security;
alter table listing_i18n      enable row level security;
alter table listing_media     enable row level security;
alter table listing_channels  enable row level security;
alter table leads             enable row level security;
alter table activities        enable row level security;
alter table deals             enable row level security;
alter table commissions       enable row level security;
alter table tenancies         enable row level security;
alter table tenancy_cheques   enable row level security;
alter table audit_log         enable row level security;

-- Profiles: staff see the team; only admins change roles.
create policy "staff read profiles"   on profiles for select to authenticated using (is_staff());
create policy "admin manage profiles" on profiles for all    to authenticated using (current_role_is(array['admin']::staff_role[])) with check (current_role_is(array['admin']::staff_role[]));
create policy "self update profile"   on profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and role = current_staff_role());

-- Reference data: any staff member reads and edits.
create policy "staff all communities" on communities for all to authenticated using (is_staff()) with check (is_staff());
create policy "staff all buildings"   on buildings   for all to authenticated using (is_staff()) with check (is_staff());

-- Listings: staff read all; agents edit their own, managers edit any.
create policy "staff read listings"  on listings for select to authenticated using (is_staff());
create policy "staff create listings" on listings for insert to authenticated with check (is_staff());
create policy "edit own or manager listings" on listings for update to authenticated
  using (is_manager() or agent_id = auth.uid()) with check (is_manager() or agent_id = auth.uid());
create policy "manager delete listings" on listings for delete to authenticated using (is_manager());

create policy "staff all listing_i18n"     on listing_i18n     for all to authenticated using (is_staff()) with check (is_staff());
create policy "staff all listing_media"    on listing_media    for all to authenticated using (is_staff()) with check (is_staff());
create policy "staff all listing_channels" on listing_channels for all to authenticated using (is_staff()) with check (is_staff());

-- Contacts and leads: agents see what is assigned to them; managers see everything.
create policy "staff read contacts" on contacts for select to authenticated using (
  is_manager()
  or exists (select 1 from leads l where l.contact_id = contacts.id and l.assigned_to = auth.uid())
  or created_by = auth.uid()
);
create policy "staff write contacts" on contacts for insert to authenticated with check (is_staff());
create policy "staff update contacts" on contacts for update to authenticated using (
  is_manager()
  or exists (select 1 from leads l where l.contact_id = contacts.id and l.assigned_to = auth.uid())
) with check (is_staff());

create policy "read own or manager leads"   on leads for select to authenticated using (is_manager() or assigned_to = auth.uid());
create policy "staff create leads"          on leads for insert to authenticated with check (is_staff());
create policy "update own or manager leads" on leads for update to authenticated
  using (is_manager() or assigned_to = auth.uid()) with check (is_manager() or assigned_to = auth.uid());

create policy "activities on visible leads" on activities for all to authenticated
  using (is_manager() or exists (select 1 from leads l where l.id = activities.lead_id and l.assigned_to = auth.uid()))
  with check (is_staff());

-- Money and leasing: managers and back office.
create policy "finance deals"       on deals       for all to authenticated using (current_role_is(array['admin','manager','back_office']::staff_role[])) with check (current_role_is(array['admin','manager','back_office']::staff_role[]));
create policy "finance commissions" on commissions for all to authenticated using (current_role_is(array['admin','manager','back_office']::staff_role[])) with check (current_role_is(array['admin','manager','back_office']::staff_role[]));
create policy "agents read own commissions" on commissions for select to authenticated
  using (splits @> jsonb_build_array(jsonb_build_object('profile_id', auth.uid()::text)));
create policy "leasing tenancies" on tenancies       for all to authenticated using (current_role_is(array['admin','manager','back_office']::staff_role[])) with check (current_role_is(array['admin','manager','back_office']::staff_role[]));
create policy "leasing cheques"   on tenancy_cheques for all to authenticated using (current_role_is(array['admin','manager','back_office']::staff_role[])) with check (current_role_is(array['admin','manager','back_office']::staff_role[]));

create policy "admin read audit" on audit_log for select to authenticated using (current_role_is(array['admin']::staff_role[]));

-- ───────────────────────── Public website access ─────────────────────────
-- The site never reads tables directly. It reads this view, which only
-- exposes live listings with an unexpired permit and public agent fields.
create view public_listings with (security_invoker = false) as
select
  l.id,
  l.slug,
  l.ref_no,
  l.purpose,
  l.market,
  l.property_type,
  l.emirate,
  l.price_aed,
  l.beds,
  l.baths,
  l.size_sqft,
  l.permit_no,
  l.permit_expiry,
  l.featured,
  l.published_at,
  b.name as building,
  jsonb_build_object('en', c.name_en, 'ar', c.name_ar, 'ru', c.name_ru) as community,
  (select jsonb_object_agg(i.lang, i.title) from listing_i18n i where i.listing_id = l.id and (i.approved or i.lang = 'en')) as title,
  (select jsonb_object_agg(i.lang, i.description) from listing_i18n i where i.listing_id = l.id and (i.approved or i.lang = 'en')) as description,
  coalesce(
    (select jsonb_agg(jsonb_build_object('url', m.url, 'alt', m.alt) order by m.sort)
       from listing_media m where m.listing_id = l.id and m.kind = 'photo'),
    '[]'::jsonb
  ) as media,
  case when p.id is null then null else
    jsonb_build_object('name', p.full_name, 'brn', p.brn, 'phone', p.phone, 'languages', to_jsonb(p.languages))
  end as agent
from listings l
left join communities c on c.id = l.community_id
left join buildings  b on b.id = l.building_id
left join profiles   p on p.id = l.agent_id and p.active
where l.status = 'live'
  and l.permit_no is not null
  and l.permit_expiry >= current_date
  and exists (select 1 from listing_channels ch where ch.listing_id = l.id and ch.channel = 'website' and ch.enabled);

revoke all on public_listings from public;
grant select on public_listings to anon, authenticated;

-- Website enquiries: anonymous visitors can only call this function.
create or replace function submit_enquiry(
  p_name text,
  p_phone text,
  p_email text,
  p_interest text,
  p_message text,
  p_listing_ref text,
  p_locale text,
  p_source_url text,
  p_utm jsonb,
  p_consent boolean
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_contact uuid;
  v_listing uuid;
  v_agent uuid;
  v_lead uuid;
begin
  if not coalesce(p_consent, false) then
    raise exception 'consent required';
  end if;
  if length(coalesce(p_name, '')) = 0 or p_phone !~ '^\+\d{8,15}$' then
    raise exception 'invalid enquiry';
  end if;

  insert into contacts (full_name, phone, email, preferred_language, consent_at, kinds)
  values (left(p_name, 120), p_phone, nullif(left(p_email, 160), ''), coalesce(p_locale, 'en'), now(), array['enquirer'])
  on conflict (phone) do update
    set email = coalesce(excluded.email, contacts.email),
        consent_at = now()
  returning id into v_contact;

  if p_listing_ref is not null then
    select id, agent_id into v_listing, v_agent from listings where ref_no = p_listing_ref;
  end if;

  insert into leads (contact_id, listing_id, source, interest, utm, source_url, assigned_to)
  values (v_contact, v_listing, 'website', left(p_interest, 40), coalesce(p_utm, '{}'::jsonb), left(p_source_url, 500), v_agent)
  returning id into v_lead;

  if p_message is not null then
    insert into activities (lead_id, contact_id, type, body, done, created_by)
    values (v_lead, v_contact, 'note', left(p_message, 2000), true, null);
  end if;

  return v_lead;
end $$;

revoke all on function submit_enquiry(text, text, text, text, text, text, text, text, jsonb, boolean) from public;
grant execute on function submit_enquiry(text, text, text, text, text, text, text, text, jsonb, boolean) to anon, authenticated;

-- Daily job: unpublish listings whose permit has expired.
-- Schedule with pg_cron:  select cron.schedule('expire-permits', '5 0 * * *', 'select expire_listing_permits()');
create or replace function expire_listing_permits() returns integer
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  update listings set status = 'pending_permit'
  where status = 'live' and (permit_expiry is null or permit_expiry < current_date);
  get diagnostics n = row_count;
  return n;
end $$;

-- New staff sign-ups get a profile (inactive until an admin activates them).
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, active)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email), false)
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();
