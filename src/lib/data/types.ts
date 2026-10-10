import type { Locale } from "@/i18n/config";

export type Localized = Record<Locale, string>;

export type PropertyType =
  | "apartment"
  | "villa"
  | "townhouse"
  | "penthouse"
  | "office"
  | "retail"
  | "plot";

export type Listing = {
  id: string;
  slug: string;
  ref: string;
  purpose: "sale" | "rent";
  market: "ready" | "off_plan";
  type: PropertyType;
  title: Localized;
  description: Localized;
  community: Localized;
  building: string | null;
  emirate: string;
  priceAed: number;
  /** Beds: 0 = studio, null = not applicable (commercial, plot). */
  beds: number | null;
  baths: number | null;
  sizeSqft: number | null;
  permitNo: string;
  permitExpiry: string;
  featured: boolean;
  images: { url: string; alt?: string }[];
  agent: { name: string; brn: string | null; phone: string; languages: string[] } | null;
};

export type LeadStage =
  | "new"
  | "contacted"
  | "qualified"
  | "viewing"
  | "offer"
  | "closed_won"
  | "closed_lost";

export type LeadSource =
  | "website"
  | "whatsapp"
  | "property_finder"
  | "bayut"
  | "dubizzle"
  | "meta_ads"
  | "google_ads"
  | "walk_in"
  | "referral"
  | "manual";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  source: LeadSource;
  stage: LeadStage;
  interest: string;
  budget: string | null;
  language: string;
  agentName: string | null;
  createdAt: string;
  lastContactAt: string | null;
};

export type ListingFilters = {
  purpose?: "sale" | "rent";
  market?: "off_plan";
  type?: PropertyType;
  q?: string;
  beds?: number;
  maxPrice?: number;
};
