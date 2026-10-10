// Showcase build only: the CRM always runs in demo mode on sample data.
import type { createStaffClient } from "@/lib/supabase/server";

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

export async function getStaffSession(): Promise<StaffSession> {
  // Fixed at build time; sample lead ages are relative to this moment.
  return { demo: true, name: "Demo user", role: "admin", now: Date.now() };
}
