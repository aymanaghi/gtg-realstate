import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createStaffClient } from "@/lib/supabase/server";

export type StaffRole = "admin" | "manager" | "agent" | "back_office";

export type StaffSession =
  | { demo: true; name: string; role: StaffRole; now: number }
  | {
      demo: false;
      now: number;
      userId: string;
      name: string;
      role: StaffRole;
      supabase: Awaited<ReturnType<typeof createStaffClient>>;
    };

/**
 * Returns the signed-in staff member, or redirects to the login page.
 * Without Supabase configured the CRM runs in demo mode on sample data.
 */
export async function getStaffSession(): Promise<StaffSession> {
  await connection();
  // Request time, read once here so pages render it consistently.
  const now = Date.now();
  if (!isSupabaseConfigured) return { demo: true, name: "Demo user", role: "admin", now };

  const supabase = await createStaffClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/crm/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.active) redirect("/crm/login?error=inactive");

  return {
    demo: false,
    now,
    userId: user.id,
    name: profile.full_name ?? user.email ?? "Staff",
    role: profile.role as StaffRole,
    supabase,
  };
}
