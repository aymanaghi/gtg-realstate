"use client";

import { useActionState } from "react";
import { submitEnquiry, type EnquiryState } from "@/app/[lang]/actions";
import type { Locale } from "@/i18n/config";

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
  lang,
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
  const [state, action, pending] = useActionState<EnquiryState, FormData>(submitEnquiry, { status: "idle" });

  if (state.status === "success") {
    return (
      <p role="status" className="rounded-lg border border-gold bg-ink p-5 text-[15px] leading-relaxed text-sand">
        {text.success}
      </p>
    );
  }

  return (
    <form action={action} aria-label={text.formLabel} className="flex flex-col gap-3.5">
      <input type="hidden" name="locale" value={lang} />
      {listingRef && <input type="hidden" name="listingRef" value={listingRef} />}
      <div aria-hidden="true" className="hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

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

      {state.status === "invalid" && (
        <p role="alert" className="text-sm font-semibold text-gold-light">
          {text.errorRequired}
        </p>
      )}
      {state.status === "error" && (
        <p role="alert" className="text-sm font-semibold text-gold-light">
          {text.errorGeneric}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="min-h-12 rounded-md bg-gold text-[15px] font-bold text-ink hover:bg-gold-light disabled:opacity-70"
      >
        {pending ? text.sending : text.submit}
      </button>
    </form>
  );
}
