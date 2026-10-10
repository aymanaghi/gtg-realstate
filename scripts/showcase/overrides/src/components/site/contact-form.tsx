"use client";

// Showcase build only (GitHub Pages has no server): the enquiry opens WhatsApp
// with the details filled in, instead of saving a lead in the CRM.

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { GTG_WHATSAPP } from "@/lib/format";

export type ContactFormText = {
  formLabel: string;
  name: string;
  phone: string;
  email: string;
  interest: string;
  message: string;
  interests: Record<string, string>;
  consent: string;
  submit: string;
  sending: string;
  success: string;
  errorRequired: string;
  errorGeneric: string;
};

const field = "min-h-11 rounded-md border border-line bg-ink px-3 text-[15px] font-medium text-sand";
const label = "tracking-caps flex flex-col gap-1.5 font-caps text-xs font-semibold uppercase text-gold";

export function ContactForm({
  text,
  listingRef,
  defaultInterest = "buy",
  showMessage = false,
}: {
  lang: Locale;
  text: ContactFormText;
  listingRef?: string;
  defaultInterest?: string;
  showMessage?: boolean;
}) {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <p role="status" className="rounded-lg border border-gold bg-ink p-5 text-[15px] leading-relaxed text-sand">
        {text.success}
      </p>
    );
  }

  return (
    <form
      aria-label={text.formLabel}
      className="flex flex-col gap-3.5"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const interest = text.interests[String(f.get("interest") ?? "")] ?? "";
        const lines = [
          `${text.name}: ${f.get("name")}`,
          `${text.phone}: ${f.get("phone")}`,
          f.get("email") ? `${text.email}: ${f.get("email")}` : "",
          listingRef ? `Ref: ${listingRef}` : interest ? `${text.interest}: ${interest}` : "",
          String(f.get("message") ?? ""),
        ].filter(Boolean);
        window.open(`${GTG_WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
        setSent(true);
      }}
    >
      <label className={label}>
        {text.name}
        <input name="name" type="text" required autoComplete="name" className={field} />
      </label>
      <label className={label}>
        {text.phone}
        <input name="phone" type="tel" required autoComplete="tel" placeholder="+971" dir="ltr" className={field} />
      </label>
      <label className={label}>
        {text.email}
        <input name="email" type="email" autoComplete="email" dir="ltr" className={field} />
      </label>
      {!listingRef && (
        <label className={label}>
          {text.interest}
          <select name="interest" defaultValue={defaultInterest} className={field}>
            {Object.entries(text.interests).map(([value, t]) => (
              <option key={value} value={value}>
                {t}
              </option>
            ))}
          </select>
        </label>
      )}
      {showMessage && (
        <label className={label}>
          {text.message}
          <textarea name="message" rows={3} className={`${field} py-2`} />
        </label>
      )}
      <label className="flex items-start gap-2.5 text-[13px] leading-normal text-sand-2">
        <input type="checkbox" name="consent" required className="mt-0.5 size-5 flex-none accent-gold" />
        {text.consent}
      </label>
      <button type="submit" className="min-h-12 rounded-md bg-gold text-[15px] font-bold text-ink hover:bg-gold-light">
        {text.submit}
      </button>
    </form>
  );
}
