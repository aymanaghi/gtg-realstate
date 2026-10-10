"use server";

import { headers } from "next/headers";
import { hasLocale } from "@/i18n/config";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/server";

export type EnquiryState = { status: "idle" | "success" | "invalid" | "error" };

const INTERESTS = new Set(["buy", "sell", "rent", "invest", "golden_visa", "management"]);

/** Normalises UAE and international numbers to E.164 where we can. */
function normalisePhone(raw: string) {
  let p = raw.replace(/[^\d+]/g, "");
  if (p.startsWith("00")) p = `+${p.slice(2)}`;
  if (p.startsWith("05")) p = `+971${p.slice(1)}`;
  if (!p.startsWith("+")) p = `+${p}`;
  return /^\+\d{8,15}$/.test(p) ? p : null;
}

const text = (v: FormDataEntryValue | null, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function submitEnquiry(_prev: EnquiryState, form: FormData): Promise<EnquiryState> {
  // Honeypot: real visitors never fill this hidden field.
  if (text(form.get("company"), 100)) return { status: "success" };

  const name = text(form.get("name"), 120);
  const phone = normalisePhone(text(form.get("phone"), 40));
  const email = text(form.get("email"), 160) || null;
  const interestRaw = text(form.get("interest"), 40);
  const interest = INTERESTS.has(interestRaw) ? interestRaw : "buy";
  const message = text(form.get("message"), 2000) || null;
  const listingRef = text(form.get("listingRef"), 40) || null;
  const localeRaw = text(form.get("locale"), 5);
  const locale = hasLocale(localeRaw) ? localeRaw : "en";
  const consent = form.get("consent") === "on";

  if (!name || !phone || !consent) return { status: "invalid" };

  const h = await headers();
  const sourceUrl = h.get("referer")?.slice(0, 500) ?? null;
  let utm: Record<string, string> = {};
  if (sourceUrl) {
    try {
      const url = new URL(sourceUrl);
      utm = Object.fromEntries(
        [...url.searchParams].filter(([k]) => k.startsWith("utm_")).map(([k, v]) => [k, v.slice(0, 100)]),
      );
    } catch {}
  }

  if (!isSupabaseConfigured) {
    console.info("[enquiry] demo mode — not stored", { name, phone, interest, listingRef, locale });
    return { status: "success" };
  }

  const { error } = await createPublicClient().rpc("submit_enquiry", {
    p_name: name,
    p_phone: phone,
    p_email: email,
    p_interest: interest,
    p_message: message,
    p_listing_ref: listingRef,
    p_locale: locale,
    p_source_url: sourceUrl,
    p_utm: utm,
    p_consent: consent,
  });

  if (error) {
    console.error("[enquiry] failed", error.message);
    return { status: "error" };
  }
  return { status: "success" };
}
