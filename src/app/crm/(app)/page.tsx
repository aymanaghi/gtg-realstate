import { Suspense } from "react";
import { getLeads, PIPELINE, SOURCE_LABEL } from "@/lib/crm/data";
import { getStaffSession } from "@/lib/crm/session";
import type { Lead, LeadSource } from "@/lib/data/types";
import { StageSelect } from "@/components/crm/stage-select";

export const metadata = { title: "Leads pipeline" };

const SLA_MINUTES = 15;

const SOURCE_STYLE: Partial<Record<LeadSource, string>> = {
  website: "bg-ink text-gold-light",
  whatsapp: "bg-[#E1EFE6] text-[#145A37]",
  property_finder: "bg-[#F6E3DE] text-[#8A2A16]",
  bayut: "bg-[#E3E7F4] text-[#1F3A8A]",
  dubizzle: "bg-[#F6E3DE] text-[#8A2A16]",
  meta_ads: "bg-[#ECE4F4] text-[#4B2A80]",
};

export default function LeadsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-[32px] font-extrabold">Leads pipeline</h1>
        <div className="mt-2.5 mb-2 h-0.5 w-30 bg-gold" />
        <p className="text-sm text-body-dark">Every enquiry from the website, WhatsApp and the portals, by stage.</p>
      </div>
      <Suspense fallback={<p className="text-body-dark">Loading leads…</p>}>
        <Board />
      </Suspense>
    </div>
  );
}

function minutesSince(iso: string, now: number) {
  return Math.floor((now - new Date(iso).getTime()) / 60_000);
}

function waitLabel(lead: Lead, now: number) {
  const ref = lead.lastContactAt ?? lead.createdAt;
  const m = minutesSince(ref, now);
  const span = m < 60 ? `${m} min` : m < 1440 ? `${Math.floor(m / 60)} h` : `${Math.floor(m / 1440)} d`;
  return lead.lastContactAt ? `Contacted ${span} ago` : `${span}, no reply`;
}

async function Board() {
  const session = await getStaffSession();
  const leads = await getLeads(session);
  const now = session.now;
  const late = leads.filter((l) => l.stage === "new" && !l.lastContactAt && minutesSince(l.createdAt, now) > SLA_MINUTES);

  return (
    <>
      {session.demo && (
        <p className="rounded-lg border border-gold bg-white px-4 py-3 text-sm">
          <strong>Demo mode.</strong> Connect Supabase (see README) to see real leads. Changes here are not saved.
        </p>
      )}
      {late.length > 0 && (
        <div className="flex items-center gap-2.5 rounded-lg bg-ink px-4.5 py-3.5 text-sm text-sand">
          <span aria-hidden="true" className="size-2 flex-none rounded-full bg-gold" />
          <span>
            <strong className="text-gold">
              {late.length} {late.length === 1 ? "lead" : "leads"} waiting over {SLA_MINUTES} minutes
            </strong>{" "}
            — reply now or they’ll be escalated to a manager.
          </span>
        </div>
      )}
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[1500px] grid-cols-6 gap-3.5">
          {PIPELINE.map(({ stage, label }) => {
            const items = leads.filter((l) => l.stage === stage);
            return (
              <section key={stage} aria-label={label} className="flex flex-col gap-2.5 rounded-xl bg-cream-2 p-3">
                <div className="flex items-center justify-between px-1 pt-1">
                  <h2 className="tracking-caps font-caps text-sm font-bold uppercase">{label}</h2>
                  <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-sand">{items.length}</span>
                </div>
                {items.map((l) => {
                  const isLate = late.includes(l);
                  return (
                    <article key={l.id} className="flex flex-col gap-2 rounded-lg border border-[#D6D1C4] bg-white p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[15px] font-bold">{l.name}</h3>
                        <span className={`rounded px-1.5 py-0.5 text-[11.5px] font-bold ${SOURCE_STYLE[l.source] ?? "bg-cream text-body-dark"}`}>
                          {SOURCE_LABEL[l.source]}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#36302C]">{l.interest}</p>
                      {l.budget && <p className="font-display text-[15px] font-bold text-gold-ink">{l.budget}</p>}
                      <div className="flex items-center justify-between border-t border-[#EFEBE3] pt-2 text-xs text-body-dark">
                        <span>
                          {l.agentName ?? "Unassigned"} · {l.language}
                        </span>
                        <span className={isLate ? "font-extrabold text-[#9A3412]" : ""}>{waitLabel(l, now)}</span>
                      </div>
                      <StageSelect leadId={l.id} stage={l.stage} demo={session.demo} />
                    </article>
                  );
                })}
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
