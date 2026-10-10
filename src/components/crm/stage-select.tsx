"use client";

import { useState, useTransition } from "react";
import { moveLead } from "@/app/crm/actions";
import type { LeadStage } from "@/lib/data/types";

const OPTIONS: { stage: LeadStage; label: string }[] = [
  { stage: "new", label: "New" },
  { stage: "contacted", label: "Contacted" },
  { stage: "qualified", label: "Qualified" },
  { stage: "viewing", label: "Viewing" },
  { stage: "offer", label: "Offer" },
  { stage: "closed_won", label: "Closed won" },
  { stage: "closed_lost", label: "Closed lost" },
];

export function StageSelect({ leadId, stage, demo }: { leadId: string; stage: LeadStage; demo: boolean }) {
  const [value, setValue] = useState(stage);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center justify-between gap-2 text-xs font-semibold text-body-dark">
        Move to
        <select
          value={value}
          disabled={pending || demo}
          onChange={(e) => {
            const next = e.target.value as LeadStage;
            const prev = value;
            setValue(next);
            setError(null);
            start(async () => {
              const res = await moveLead(leadId, next);
              if (!res.ok) {
                setValue(prev);
                setError(res.error ?? "Could not move lead");
              }
            });
          }}
          className="min-h-9 flex-1 rounded border border-[#CFC8B8] bg-white px-2 text-xs text-ink disabled:opacity-60"
        >
          {OPTIONS.map((o) => (
            <option key={o.stage} value={o.stage}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <p role="alert" className="text-xs font-semibold text-[#9A3412]">
          {error}
        </p>
      )}
    </div>
  );
}
