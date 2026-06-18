import type { LobbyCampaign } from "@/lib/lobby/types";
import { getSupabase } from "./client";

export async function fetchLobbyCampaign(userId: string): Promise<LobbyCampaign | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("user_data")
    .select("lobby_campaign")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data?.lobby_campaign as LobbyCampaign | null) ?? null;
}

export async function saveLobbyCampaign(userId: string, campaign: LobbyCampaign): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.from("user_data").upsert({
    user_id: userId,
    lobby_campaign: campaign,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
}
