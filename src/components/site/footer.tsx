import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";

export function SiteFooter({ dict }: { dict: Dictionary }) {
  return (
    <footer className="bg-ink px-6 pb-10">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 border-t border-line pt-6 text-[13px] text-muted-2">
        <span>{dict.footer.line}</span>
        <span className="flex flex-wrap gap-4">
          <span>{dict.footer.licence}</span>
          <Link href="/crm" className="text-muted-2 underline decoration-line underline-offset-4 hover:text-gold-light" prefetch={false}>
            {dict.footer.staff}
          </Link>
        </span>
      </div>
    </footer>
  );
}
