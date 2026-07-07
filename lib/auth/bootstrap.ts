import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getMembershipState } from "@/lib/launch/launch-service";

function metaString(user: User, key: string) {
  const value = user.user_metadata?.[key];
  return typeof value === "string" ? value : "";
}

function metaNumber(user: User, key: string) {
  const value = user.user_metadata?.[key];
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return Number(value);
  return null;
}

export async function ensureUserDefaults(supabase: SupabaseClient, user: User) {
  const fullName = metaString(user, "full_name") || metaString(user, "name") || user.email?.split("@")[0] || "";
  const country = metaString(user, "country");
  const education = metaString(user, "education");
  const currentStatus = metaString(user, "current_status") || metaString(user, "employment_status");
  const today = new Date().toISOString().slice(0, 10);

  await supabase.from("user_profiles").upsert(
    {
      id: user.id,
      user_id: user.id,
      full_name: fullName,
      email: user.email ?? "",
      country: country || null,
      age: metaNumber(user, "age"),
      education: education || null,
      current_status: currentStatus || null,
      employment_status: currentStatus || null,
      premium_status: "free",
      plan: "free",
      mentor_messages_today: 0,
      mentor_messages_date: today,
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id" }
  );

  const membership = await getMembershipState(supabase, user.id);
  return { membership };
}
