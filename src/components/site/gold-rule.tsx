export function GoldRule({ className = "w-54" }: { className?: string }) {
  return <div aria-hidden="true" className={`h-0.5 bg-gold ${className}`} />;
}
