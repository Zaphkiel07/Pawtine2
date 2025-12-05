import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatISO } from "date-fns";
import { isSupabaseConfigured } from "@/lib/config";
import { demoRunOnboarding } from "@/lib/demo-store";

interface OnboardingPayload {
  email?: string;
  name?: string;
  timezone?: string;
  dogName: string;
  dogBreed?: string;
  dogAgeMonths?: number | null;
  routines: Array<{
    type: "feed" | "walk" | "water" | "custom";
    label: string;
    scheduled_time: string;
  }>;
}

export async function runOnboarding(payload: OnboardingPayload) {
  if (!isSupabaseConfigured) {
    return demoRunOnboarding({
      dogName: payload.dogName,
      dogBreed: payload.dogBreed,
      timezone: payload.timezone,
      routines: payload.routines,
    });
  }

  const supabase = createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id ?? crypto.randomUUID();

  if (!user) {
    await supabase.from("users").upsert(
      {
        id: userId,
        email: payload.email ?? `demo+${userId}@pawtine.dev`,
        name: payload.name ?? "Pawtine Pal",
        timezone: payload.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
        created_at: formatISO(new Date()),
      },
      { onConflict: "id" },
    );
  }

  const { data: dog } = await supabase
    .from("dogs")
    .upsert(
      {
        user_id: userId,
        name: payload.dogName,
        breed: payload.dogBreed,
        age_months: payload.dogAgeMonths ?? null,
        created_at: formatISO(new Date()),
      },
      { onConflict: "user_id" },
    )
    .select()
    .single();

  if (!dog) {
    throw new Error("Unable to create dog profile.");
  }

  if (payload.routines?.length) {
    const insertRows = payload.routines.map((routine) => ({
      dog_id: dog.id,
      type: routine.type,
      label: routine.label,
      scheduled_time: routine.scheduled_time,
      status: "active" as const,
      created_at: formatISO(new Date()),
    }));

    await supabase.from("routines").insert(insertRows);
  }

  return { userId, dogId: dog.id };
}
