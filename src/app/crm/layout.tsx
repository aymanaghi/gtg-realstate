import type { Metadata } from "next";
import "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "GTG CRM", template: "%s | GTG CRM" },
  robots: { index: false, follow: false },
};

export default function CrmRootLayout({ children }: LayoutProps<"/crm">) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen bg-cream text-ink">{children}</body>
    </html>
  );
}
