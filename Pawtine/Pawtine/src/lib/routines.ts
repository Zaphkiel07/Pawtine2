import { addDays, addHours, endOfMonth, formatISO, parseISO, startOfDay, startOfMonth } from "date-fns";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Database } from "@/lib/database.types";
import { isSupabaseConfigured } from "@/lib/config";
import {
  demoCreateRoutine,
  demoFetchAllRoutines,
  demoFetchCurrentUserAndDog,
  demoFetchDailyRoutines,
  demoFetchMonthlySchedule,
  demoFetchWeeklySummary,
  demoMarkRoutineComplete,
  demoSnoozeRoutine,
  demoUpdateRoutine,
} from "@/lib/demo-store";

export type RoutineWithToday =
  Database["public"]["Tables"]["routines"]["Row"] & {
    todayStatus: Database["public"]["Tables"]["history"]["Row"] | null;
  };

export type CalendarTask = {
  id: string;
  label: string;
  type: Database["public"]["Tables"]["routines"]["Row"]["type"];
  scheduled_time: string;
};

export async function fetchCurrentUserAndDog() {
  if (!isSupabaseConfigured) {
    return demoFetchCurrentUserAndDog();
  }

  const supabase = createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id ?? process.env.NEXT_PUBLIC_DEMO_USER_ID;

  if (!userId) {
    throw new Error(
      "No authenticated user found. Provide NEXT_PUBLIC_DEMO_USER_ID for local testing.",
    );
  }

  const { data: dog } = await supabase
    .from("dogs")
    .select("*, routines(*), history:history(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!dog) {
    return { userId, dog: null };
  }

  return { userId, dog };
}

export async function fetchDailyRoutines(): Promise<RoutineWithToday[]> {
  if (!isSupabaseConfigured) {
    return demoFetchDailyRoutines();
  }

  const supabase = createServerSupabaseClient();
  const { dog } = await fetchCurrentUserAndDog();

  if (!dog) {
    return [];
  }

  const today = formatISO(startOfDay(new Date()), { representation: "date" });

  const { data: routines, error } = await supabase
    .from("routines")
    .select("*")
    .eq("dog_id", dog.id)
    .eq("status", "active")
    .order("scheduled_time", { ascending: true });

  if (error) {
    throw error;
  }

  if (!routines?.length) {
    return [];
  }

  const { data: historyRows, error: historyError } = await supabase
    .from("history")
    .select("*")
    .eq("occurred_on", today)
    .in(
      "routine_id",
      routines.map((routine) => routine.id),
    );

  if (historyError) {
    throw historyError;
  }

  const historyByRoutine = new Map(
    (historyRows ?? []).map((row) => [row.routine_id, row]),
  );

  return routines.map((routine) => ({
    ...routine,
    todayStatus: historyByRoutine.get(routine.id) ?? null,
  }));
}

export async function fetchWeeklySummary(weekStart: string) {
  if (!isSupabaseConfigured) {
    return demoFetchWeeklySummary(weekStart);
  }

  const supabase = createServerSupabaseClient();
  const { dog } = await fetchCurrentUserAndDog();

  if (!dog) {
    return [];
  }

  const { data, error } = await supabase.rpc("get_weekly_routine_summary", {
    p_dog_id: dog.id,
    p_week_start: weekStart,
  });

  if (!error && data) {
    return data;
  }

  const endOfRange = formatISO(addDays(parseISO(weekStart), 7), {
    representation: "date",
  });

  const { data: routineRows, error: routineError } = await supabase
    .from("routines")
    .select("id, type, label")
    .eq("dog_id", dog.id);

  if (routineError) {
    throw routineError;
  }

  const routineMap = new Map(
    (routineRows ?? []).map((routine) => [routine.id, routine]),
  );

  const routineIds = Array.from(routineMap.keys());

  if (!routineIds.length) {
    return [];
  }

  const { data: fallbackRows, error: fallbackError } = await supabase
    .from("history")
    .select("*")
    .in("routine_id", routineIds)
    .gte("occurred_on", weekStart)
    .lt("occurred_on", endOfRange);

  if (fallbackError) {
    throw fallbackError;
  }

  return (
    fallbackRows?.map((row) => {
      const routine = routineMap.get(row.routine_id);
      return {
        routine_id: row.routine_id,
        type: routine?.type,
        label: routine?.label,
        status: row.status,
        day: row.occurred_on,
      };
    }) ?? []
  );
}

export async function fetchAllRoutines() {
  if (!isSupabaseConfigured) {
    return demoFetchAllRoutines();
  }

  const supabase = createServerSupabaseClient();
  const { dog } = await fetchCurrentUserAndDog();

  if (!dog) {
    return [];
  }

  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("dog_id", dog.id)
    .order("scheduled_time", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function fetchMonthlySchedule(referenceDate = new Date()): Promise<CalendarTask[]> {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);

  if (!isSupabaseConfigured) {
    return demoFetchMonthlySchedule(monthStart, monthEnd).map((routine) => ({
      id: routine.id,
      label: routine.label,
      type: routine.type,
      scheduled_time: routine.scheduled_time,
    }));
  }

  const supabase = createServerSupabaseClient();
  const { dog } = await fetchCurrentUserAndDog();

  if (!dog) {
    return [];
  }

  const { data, error } = await supabase
    .from("routines")
    .select("id,label,type,scheduled_time")
    .eq("dog_id", dog.id)
    .eq("status", "active")
    .gte("scheduled_time", formatISO(monthStart))
    .lte("scheduled_time", formatISO(monthEnd));

  if (error) {
    throw error;
  }

  return (
    data?.map((item) => ({
      id: item.id,
      label: item.label ?? "Routine",
      type: item.type as Database["public"]["Tables"]["routines"]["Row"]["type"],
      scheduled_time: item.scheduled_time,
    })) ?? []
  );
}

export async function markRoutineComplete(routineId: string) {
  if (!isSupabaseConfigured) {
    return demoMarkRoutineComplete(routineId);
  }

  const supabase = createServerSupabaseClient();
  const occurredOn = formatISO(startOfDay(new Date()), {
    representation: "date",
  });
  const now = formatISO(new Date());

  const { data, error } = await supabase
    .from("history")
    .upsert(
      {
        routine_id: routineId,
        occurred_on: occurredOn,
        status: "done",
        created_at: now,
      },
      {
        onConflict: "routine_id,occurred_on",
      },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  await supabase
    .from("routines")
    .update({ last_completed_at: now })
    .eq("id", routineId);

  return data;
}

export async function snoozeRoutine(
  routineId: string,
  hoursToAdd = 1,
) {
  if (!isSupabaseConfigured) {
    return demoSnoozeRoutine(routineId, hoursToAdd);
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("routines")
    .update({
      scheduled_time: formatISO(addHours(new Date(), hoursToAdd)),
    })
    .eq("id", routineId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateRoutineSettings(
  routineId: string,
  payload: Partial<Database["public"]["Tables"]["routines"]["Update"]>,
) {
  if (!isSupabaseConfigured) {
    return demoUpdateRoutine(routineId, payload);
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("routines")
    .update(payload)
    .eq("id", routineId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createRoutine(
  payload: Database["public"]["Tables"]["routines"]["Insert"],
) {
  if (!isSupabaseConfigured) {
    return demoCreateRoutine(payload);
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("routines")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
