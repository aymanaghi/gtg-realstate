"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/crm", label: "Leads" },
  { href: "/crm/listings", label: "Listings" },
];

const soon = ["Contacts", "Deals", "Commissions", "Landlords & tenancies", "WhatsApp inbox", "Reports"];

export function CrmNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="CRM" className="flex flex-col gap-1">
      {items.map((i) => {
        const active = pathname === i.href;
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center rounded-md px-3 text-sm ${
              active ? "bg-panel-2 font-bold text-gold" : "font-semibold text-[#CFC6B8] hover:text-gold-light"
            }`}
          >
            {i.label}
          </Link>
        );
      })}
      {soon.map((label) => (
        <span key={label} className="flex min-h-11 items-center justify-between rounded-md px-3 text-sm font-semibold text-muted-2">
          {label}
          <span className="text-[11px] font-medium text-muted-2">Soon</span>
        </span>
      ))}
    </nav>
  );
}
