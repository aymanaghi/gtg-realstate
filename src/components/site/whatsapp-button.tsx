import { GTG_WHATSAPP } from "@/lib/format";

export function WhatsAppButton({ label }: { label: string }) {
  return (
    <a
      href={GTG_WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="fixed bottom-6 end-6 z-40 flex h-15 w-15 items-center justify-center rounded-full bg-gold shadow-lg shadow-black/40 hover:bg-gold-light"
    >
      <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#120E10" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21l1.6-4.6A8.5 8.5 0 1 1 8 19.6L3 21z" />
        <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8c-1-.4-1.9-1.3-2.3-2.3l.8-1-1-2L9 9.5z" />
      </svg>
    </a>
  );
}
