"use client";

import { useId, useState } from "react";

type Text = { mortgage: string; downPayment: string; term: string; rate: string; monthly: string; mortgageNote: string };

const field = "min-h-11 rounded-md border border-[#CFC8B8] bg-white px-3 text-[15px] font-medium text-ink";
const label = "tracking-caps flex flex-col gap-1.5 font-caps text-xs font-semibold uppercase text-gold-ink";

export function MortgageCalculator({ price, intl, text }: { price: number; intl: string; text: Text }) {
  const [down, setDown] = useState(20);
  const [years, setYears] = useState(25);
  const [rate, setRate] = useState(4.5);
  const id = useId();

  const principal = price * (1 - Math.min(Math.max(down, 0), 100) / 100);
  const n = Math.max(years, 1) * 12;
  const r = rate / 100 / 12;
  const monthly = r === 0 ? principal / n : (principal * r) / (1 - (1 + r) ** -n);

  return (
    <section aria-labelledby={`${id}-h`} className="flex flex-col gap-4 rounded-xl bg-cream p-7 text-ink">
      <h2 id={`${id}-h`} className="font-display text-[26px] font-bold">
        {text.mortgage}
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
        <label className={label}>
          {text.downPayment}
          <input type="number" min={0} max={100} value={down} onChange={(e) => setDown(Number(e.target.value))} className={field} />
        </label>
        <label className={label}>
          {text.term}
          <input type="number" min={1} max={30} value={years} onChange={(e) => setYears(Number(e.target.value))} className={field} />
        </label>
        <label className={label}>
          {text.rate}
          <input type="number" min={0} max={20} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} className={field} />
        </label>
      </div>
      <p className="text-base" aria-live="polite">
        {text.monthly}:{" "}
        <strong dir="ltr">AED {new Intl.NumberFormat(intl, { maximumFractionDigits: 0 }).format(Number.isFinite(monthly) ? monthly : 0)}</strong>
      </p>
      <p className="text-[13px] text-body-dark">{text.mortgageNote}</p>
    </section>
  );
}
