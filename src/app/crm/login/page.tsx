import Image from "next/image";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6 text-sand">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-panel p-8">
        <div className="mb-6 flex items-center gap-3">
          <Image src="/images/gtg-logo.jpg" alt="GTG Real Estate" width={150} height={141} className="h-14 w-15 rounded object-contain" />
          <div>
            <p className="tracking-caps font-caps text-sm font-bold uppercase text-gold">GTG CRM</p>
            <p className="text-sm text-muted">Staff sign in</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
