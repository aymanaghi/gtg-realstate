import { Suspense } from "react";
import { getStaffListings } from "@/lib/crm/data";
import { getStaffSession } from "@/lib/crm/session";

export const metadata = { title: "Listings" };

export default function ListingsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-[32px] font-extrabold">Listings</h1>
        <div className="mt-2.5 mb-2 h-0.5 w-30 bg-gold" />
        <p className="text-sm text-body-dark">
          A listing only goes live with a valid DLD permit. It is unpublished automatically when the permit expires.
        </p>
      </div>
      <Suspense fallback={<p className="text-body-dark">Loading listings…</p>}>
        <ListingsTable />
      </Suspense>
    </div>
  );
}

function permitStatus(expiry: string | null, now: number) {
  if (!expiry) return { text: "No permit", tone: "text-[#9A3412] font-bold" };
  const days = Math.ceil((new Date(`${expiry}T23:59:59Z`).getTime() - now) / 86_400_000);
  if (days < 0) return { text: "Expired", tone: "text-[#9A3412] font-bold" };
  if (days <= 10) return { text: `Expires in ${days} d`, tone: "text-gold-ink font-bold" };
  return { text: `Valid · ${expiry}`, tone: "text-body-dark" };
}

async function ListingsTable() {
  const session = await getStaffSession();
  const listings = await getStaffListings(session);
  const now = session.now;
  const aed = new Intl.NumberFormat("en-AE");

  return (
    <div className="overflow-x-auto rounded-xl border border-[#D6D1C4] bg-white">
      <table className="w-full min-w-[900px] text-start text-sm">
        <thead className="bg-ink text-sand">
          <tr>
            {["Ref", "Listing", "Purpose", "Price (AED)", "Status", "DLD permit", "Agent"].map((h) => (
              <th key={h} scope="col" className="tracking-caps px-4 py-3 text-start font-caps text-xs font-semibold uppercase text-gold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {listings.map((l) => {
            const permit = permitStatus(l.permitExpiry, now);
            return (
              <tr key={l.id} className="border-t border-[#EFEBE3]">
                <td className="px-4 py-3 font-mono text-xs">{l.ref}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold">{l.title}</div>
                  <div className="text-xs text-body-dark">{l.community}</div>
                </td>
                <td className="px-4 py-3 capitalize">{l.purpose}</td>
                <td className="px-4 py-3 tabular-nums">{aed.format(l.priceAed)}</td>
                <td className="px-4 py-3 capitalize">{l.status.replace("_", " ")}</td>
                <td className="px-4 py-3">
                  <div>{l.permitNo ?? "—"}</div>
                  <div className={`text-xs ${permit.tone}`}>{permit.text}</div>
                </td>
                <td className="px-4 py-3">{l.agentName ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
