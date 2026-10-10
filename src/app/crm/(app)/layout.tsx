import Image from "next/image";
import { Suspense } from "react";
import { getStaffSession } from "@/lib/crm/session";
import { CrmNav } from "@/components/crm/nav";
import { signOut } from "../actions";

export default function CrmAppLayout({ children }: LayoutProps<"/crm">) {
  return (
    <div className="flex min-h-screen flex-wrap">
      <aside className="flex max-w-full flex-[1_1_230px] flex-col gap-1 bg-ink px-4 py-5 text-sand md:min-h-screen md:max-w-[260px]">
        <div className="flex items-center gap-3 px-1.5 pb-5">
          <Image src="/images/gtg-logo.jpg" alt="GTG Real Estate" width={150} height={141} className="h-12 w-13 rounded object-contain" />
          <span className="tracking-caps font-caps text-[15px] font-bold uppercase text-gold">GTG CRM</span>
        </div>
        <CrmNav />
        <div className="mt-auto border-t border-line-soft px-2 pt-4">
          <Suspense fallback={<div className="h-10" />}>
            <UserChip />
          </Suspense>
        </div>
      </aside>
      <main className="min-w-0 flex-[999_1_560px] p-7">{children}</main>
    </div>
  );
}

async function UserChip() {
  const session = await getStaffSession();
  return (
    <div className="flex items-center justify-between gap-2 text-[13px]">
      <div>
        <div className="font-bold">{session.name}</div>
        <div className="text-muted capitalize">{session.demo ? "Demo mode" : session.role.replace("_", " ")}</div>
      </div>
      {!session.demo && (
        <form action={signOut}>
          <button type="submit" className="min-h-11 rounded-md px-3 text-muted hover:text-gold-light">
            Sign out
          </button>
        </form>
      )}
    </div>
  );
}
