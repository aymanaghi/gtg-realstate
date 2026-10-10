"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createStaffClient } from "@/lib/supabase/server";
import type { LeadStage } from "@/lib/data/types";

const STAGES = new Set<LeadStage>(["new", "contacted", "qualified", "viewing", "offer", "closed_won", "closed_lost"]);

export type LoginState = { error: string | null };

export async function signIn(_prev: LoginState, form: FormData): Promise<LoginState> {
  if (!isSupabaseConfigured) redirect("/crm");

  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createStaffClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Email or password is incorrect." };

  redirect("/crm");
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createStaffClient();
    await supabase.auth.signOut();
  }
  redirect("/crm/login");
}

/** Moves a lead to another pipeline stage. RLS decides whether this user may. */
export async function moveLead(leadId: string, stage: LeadStage): Promise<{ ok: boolean; error?: string }> {
  if (!STAGES.has(stage)) return { ok: false, error: "Unknown stage" };
  if (!isSupabaseConfigured) return { ok: true };

  const supabase = await createStaffClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Signed out" };

  const { error } = await supabase.from("leads").update({ stage }).eq("id", leadId);
  if (error) return { ok: false, error: error.message };

  refresh();
  return { ok: true };
}
