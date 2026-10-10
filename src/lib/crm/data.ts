import "server-only";
import { sampleLeads, sampleListings } from "@/lib/data/sample";
import type { Lead, LeadSource, LeadStage } from "@/lib/data/types";
import type { StaffSession } from "./session";

export const PIPELINE: { stage: LeadStage; label: string }[] = [
  { stage: "new", label: "New" },
  { stage: "contacted", label: "Contacted" },
  { stage: "qualified", label: "Qualified" },
  { stage: "viewing", label: "Viewing" },
  { stage: "offer", label: "Offer" },
  { stage: "closed_won", label: "Closed won" },
];

export const ALL_STAGES: { stage: LeadStage; label: string }[] = [
  ...PIPELINE,
  { stage: "closed_lost", label: "Closed lost" },
];

export const SOURCE_LABEL: Record<LeadSource, string> = {
  website: "Website",
  whatsapp: "WhatsApp",
  property_finder: "Property Finder",
  bayut: "Bayut",
  dubizzle: "Dubizzle",
  meta_ads: "Meta ads",
  google_ads: "Google ads",
  walk_in: "Walk-in",
  referral: "Referral",
  manual: "Manual",
};

type LeadRow = {
  id: string;
  stage: LeadStage;
  source: LeadSource;
  interest: string | null;
  budget_text: string | null;
  created_at: string;
  last_contact_at: string | null;
  contact: { full_name: string; phone: string; preferred_language: string | null } | null;
  agent: { full_name: string | null } | null;
};

export async function getLeads(session: StaffSession): Promise<Lead[]> {
  if (session.demo) {
    const at = (v: string | null) => (v?.startsWith("-") ? new Date(session.now + Number(v) * 60_000).toISOString() : v);
    return sampleLeads.map((l) => ({ ...l, createdAt: at(l.createdAt)!, lastContactAt: at(l.lastContactAt) }));
  }

  // RLS limits agents to their own leads; managers and admins see all.
  const { data, error } = await session.supabase
    .from("leads")
    .select(
      "id, stage, source, interest, budget_text, created_at, last_contact_at, contact:contacts(full_name, phone, preferred_language), agent:profiles!leads_assigned_to_fkey(full_name)",
    )
    .neq("stage", "closed_lost")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw new Error(`Could not load leads: ${error.message}`);

  return (data as unknown as LeadRow[]).map((r) => ({
    id: r.id,
    name: r.contact?.full_name ?? "Unknown",
    phone: r.contact?.phone ?? "",
    source: r.source,
    stage: r.stage,
    interest: r.interest ?? "",
    budget: r.budget_text,
    language: (r.contact?.preferred_language ?? "en").toUpperCase(),
    agentName: r.agent?.full_name ?? null,
    createdAt: r.created_at,
    lastContactAt: r.last_contact_at,
  }));
}

export type StaffListing = {
  id: string;
  ref: string;
  title: string;
  community: string;
  purpose: "sale" | "rent";
  priceAed: number;
  status: string;
  permitNo: string | null;
  permitExpiry: string | null;
  agentName: string | null;
};

type StaffListingRow = {
  id: string;
  ref_no: string;
  purpose: "sale" | "rent";
  price_aed: number;
  status: string;
  permit_no: string | null;
  permit_expiry: string | null;
  community: { name_en: string } | null;
  i18n: { lang: string; title: string }[];
  agent: { full_name: string | null } | null;
};

export async function getStaffListings(session: StaffSession): Promise<StaffListing[]> {
  if (session.demo) {
    return sampleListings.map((l) => ({
      id: l.id,
      ref: l.ref,
      title: l.title.en,
      community: l.community.en,
      purpose: l.purpose,
      priceAed: l.priceAed,
      status: "live",
      permitNo: l.permitNo,
      permitExpiry: l.permitExpiry,
      agentName: l.agent?.name ?? null,
    }));
  }

  const { data, error } = await session.supabase
    .from("listings")
    .select(
      "id, ref_no, purpose, price_aed, status, permit_no, permit_expiry, community:communities(name_en), i18n:listing_i18n(lang, title), agent:profiles!listings_agent_id_fkey(full_name)",
    )
    .order("updated_at", { ascending: false })
    .limit(500);

  if (error) throw new Error(`Could not load listings: ${error.message}`);

  return (data as unknown as StaffListingRow[]).map((r) => ({
    id: r.id,
    ref: r.ref_no,
    title: r.i18n.find((x) => x.lang === "en")?.title ?? r.ref_no,
    community: r.community?.name_en ?? "",
    purpose: r.purpose,
    priceAed: Number(r.price_aed),
    status: r.status,
    permitNo: r.permit_no,
    permitExpiry: r.permit_expiry,
    agentName: r.agent?.full_name ?? null,
  }));
}
