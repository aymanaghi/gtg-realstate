"use client";

// Showcase build only: stage changes stay in the browser (nothing is saved).

import { useState } from "react";
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

export function StageSelect({ stage }: { leadId: string; stage: LeadStage; demo: boolean }) {
  const [value, setValue] = useState(stage);
  return (
    <label className="flex items-center justify-between gap-2 text-xs font-semibold text-body-dark">
      Move to
      <select
        value={value}
        onChange={(e) => setValue(e.target.value as LeadStage)}
        className="min-h-9 flex-1 rounded border border-[#CFC8B8] bg-white px-2 text-xs text-ink"
      >
        {OPTIONS.map((o) => (
          <option key={o.stage} value={o.stage}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
