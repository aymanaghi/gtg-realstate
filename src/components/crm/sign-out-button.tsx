import { signOut } from "@/app/crm/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="min-h-11 rounded-md px-3 text-muted hover:text-gold-light">
        Sign out
      </button>
    </form>
  );
}
