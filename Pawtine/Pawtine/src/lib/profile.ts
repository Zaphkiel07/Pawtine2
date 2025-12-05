import { formatISO } from "date-fns";
import { Database } from "@/lib/database.types";
import { isSupabaseConfigured } from "@/lib/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  demoFetchProfile,
  demoUpdateProfile,
} from "@/lib/demo-store";
import { redirect } from "next/navigation";

export type ProfileData = {
  user: Database["public"]["Tables"]["users"]["Row"] | null;
  dog: Database["public"]["Tables"]["dogs"]["Row"] | null;
};

function replaceAll(source: string, search: string, replacement: string) {
  return source.split(search).join(replacement);
}

function computeRoutineLabel(
  type: Database["public"]["Tables"]["routines"]["Row"]["type"],
  label: string,
  dogName: string,
  previousName?: string | null,
) {
  if (previousName && label.includes(previousName)) {
    return replaceAll(label, previousName, dogName);
  }

  const lower = label.toLowerCase();

  if (type === "feed") {
    if (lower.includes("breakfast")) {
      return `${dogName} breakfast`;
    }
    if (lower.includes("dinner")) {
      return `${dogName} dinner`;
    }
  }

  if (type === "water") {
    if (lower.includes("water")) {
      return `${dogName} water refresh`;
    }
  }

  if (type === "walk") {
    const match = label.match(/walk(?:\s*#\s*(\d+))?/i);
    if (match) {
      const walkNumber = match[1];
      if (walkNumber) {
        return `${dogName} walk #${walkNumber}`;
      }
      return `${dogName} walk`;
    }
  }

  return null;
}

function resolveUserId(userId?: string | null) {
  return userId ?? process.env.NEXT_PUBLIC_DEMO_USER_ID ?? null;
}

export async function fetchProfile(): Promise<ProfileData> {
  if (!isSupabaseConfigured) {
    return demoFetchProfile();
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = resolveUserId(user?.id) ?? undefined;

  if (!userId) {
    return { user: null, dog: null };
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  const { data: dogRow } = await supabase
    .from("dogs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return { user: userRow ?? null, dog: dogRow ?? null };
}

export async function updateProfile(payload: {
  userName?: string;
  timezone?: string;
  dogName?: string;
  dogBreed?: string;
  dogAgeMonths?: number | null;
}) {
  if (!isSupabaseConfigured) {
    return demoUpdateProfile({
      user: {
        name: payload.userName,
        timezone: payload.timezone,
      },
      dog: {
        name: payload.dogName,
        breed: payload.dogBreed,
        age_months: payload.dogAgeMonths ?? undefined,
      },
    });
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = resolveUserId(user?.id);

  if (!userId) {
    throw new Error("User is not authenticated and no demo user is configured.");
  }

  const now = formatISO(new Date());

  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  const desiredUser: Database["public"]["Tables"]["users"]["Insert"] = {
    id: userId,
    email: existingUser?.email ?? user?.email ?? `${userId}@pawtine.dev`,
    name: payload.userName ?? existingUser?.name ?? "Pawtine Pal",
    timezone:
      payload.timezone ?? existingUser?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    created_at: existingUser?.created_at ?? now,
  };

  let finalUser = existingUser;
  if (existingUser) {
    const { data: updated } = await supabase
      .from("users")
      .update({
        name: desiredUser.name,
        timezone: desiredUser.timezone,
      })
      .eq("id", userId)
      .select()
      .single();
    finalUser = updated ?? desiredUser;
  } else {
    const { data: inserted } = await supabase
      .from("users")
      .insert(desiredUser)
      .select()
      .single();
    finalUser = inserted ?? desiredUser;
  }

  const { data: existingDog } = await supabase
    .from("dogs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const desiredDog: Database["public"]["Tables"]["dogs"]["Insert"] = {
    id: existingDog?.id,
    user_id: userId,
    name: payload.dogName ?? existingDog?.name ?? "Unnamed Pup",
    breed: payload.dogBreed ?? existingDog?.breed ?? null,
    age_months: payload.dogAgeMonths ?? existingDog?.age_months ?? null,
    created_at: existingDog?.created_at ?? now,
  };

  let finalDog = existingDog;
  if (existingDog) {
    const { data: updatedDog } = await supabase
      .from("dogs")
      .update({
        name: desiredDog.name,
        breed: desiredDog.breed,
        age_months: desiredDog.age_months,
      })
      .eq("id", existingDog.id)
      .select()
      .single();
    finalDog = updatedDog ?? desiredDog;
  } else {
    const { data: insertedDog } = await supabase
      .from("dogs")
      .insert({
        user_id: desiredDog.user_id,
        name: desiredDog.name,
        breed: desiredDog.breed,
        age_months: desiredDog.age_months,
        created_at: desiredDog.created_at,
      })
      .select()
      .single();
    finalDog = insertedDog ?? desiredDog;
  }

  if (finalDog?.id && finalDog.name) {
    const dogName = finalDog.name;
    const { data: routines } = await supabase
      .from("routines")
      .select("id,label,type")
      .eq("dog_id", finalDog.id);

    const updates =
      routines
        ?.map((routine) => {
          const newLabel = computeRoutineLabel(
            routine.type as Database["public"]["Tables"]["routines"]["Row"]["type"],
            routine.label ?? "",
            dogName,
            existingDog?.name,
          );
          if (newLabel && newLabel !== routine.label) {
            return { id: routine.id, label: newLabel };
          }
          return null;
        })
        .filter((item): item is { id: string; label: string } => Boolean(item)) ?? [];

    if (updates.length) {
      await supabase.from("routines").upsert(updates);
    }
  }

  return {
    user: finalUser ?? null,
    dog: finalDog ?? null,
  };
}

export async function assertProfileComplete() {
  const profile = await fetchProfile();
  const isComplete = Boolean(
    profile.user?.name?.trim() && profile.dog?.name?.trim(),
  );

  if (!isComplete) {
    redirect("/profile");
  }

  return profile;
}
