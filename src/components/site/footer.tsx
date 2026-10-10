import type { Dictionary } from "@/i18n/dictionaries";

export function SiteFooter({ dict }: { dict: Dictionary }) {
  return (
    <footer className="bg-ink px-6 pb-10">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 border-t border-line pt-6 text-[13px] text-muted-2">
        <span>{dict.footer.line}</span>
        <span>{dict.footer.licence}</span>
      </div>
    </footer>
  );
}
