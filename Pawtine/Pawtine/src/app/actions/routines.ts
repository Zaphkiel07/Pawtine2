"use server";

import { revalidatePath } from "next/cache";
import {
  createRoutine,
  markRoutineComplete,
  snoozeRoutine,
  updateRoutineSettings,
} from "@/lib/routines";
import { fetchCurrentUserAndDog } from "@/lib/routines";
import { formatISO, set } from "date-fns";
import { Database } from "@/lib/database.types";
import {
  calendarRoutineSchema,
  createRoutineSchema,
  formDataToObject,
  updateRoutineSchema,
} from "@/lib/validation";

export async function completeRoutineAction(formData: FormData) {
  const routineId = String(formData.get("routineId"));
  await markRoutineComplete(routineId);
  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function snoozeRoutineAction(formData: FormData) {
  const routineId = String(formData.get("routineId"));
  const hours = Number(formData.get("hours")) || 1;
  await snoozeRoutine(routineId, hours);
  revalidatePath("/");
}

export async function updateRoutineAction(formData: FormData) {
  const routineId = String(formData.get("routineId"));
  const parsed = updateRoutineSchema.parse(formDataToObject(formData));
  const normalizedTime = normalizeTime(parsed.scheduled_time ?? null);

  await updateRoutineSettings(routineId, {
    label: parsed.label,
    scheduled_time: normalizedTime,
    status: parsed.status,
  });

  revalidatePath("/settings");
  revalidatePath("/");
}

export async function createRoutineAction(formData: FormData) {
  const parsed = createRoutineSchema.parse(formDataToObject(formData));
  const normalizedTime = normalizeTime(parsed.scheduled_time ?? null);

  const { dog } = await fetchCurrentUserAndDog();

  if (!dog) {
    throw new Error("Create a dog profile before adding routines.");
  }

  await createRoutine({
    dog_id: dog.id,
    type: parsed.type,
    label: parsed.label,
    scheduled_time: normalizedTime,
    status: "active",
  });

  revalidatePath("/settings");
  revalidatePath("/");
}

export async function createCalendarRoutineAction(formData: FormData) {
  const parsed = calendarRoutineSchema.parse(formDataToObject(formData));

  const [hoursString, minutesString] = parsed.time.split(":");
  const hours = Number.parseInt(hoursString ?? "0", 10);
  const minutes = Number.parseInt(minutesString ?? "0", 10);

  const scheduled = set(new Date(parsed.date), {
    hours: Number.isNaN(hours) ? 0 : hours,
    minutes: Number.isNaN(minutes) ? 0 : minutes,
    seconds: 0,
    milliseconds: 0,
  });

  const scheduledISO = formatISO(scheduled);

  const { dog } = await fetchCurrentUserAndDog();

  if (!dog) {
    throw new Error("Create a dog profile before adding routines.");
  }

  await createRoutine({
    dog_id: dog.id,
    type: parsed.type,
    label: parsed.label,
    scheduled_time: scheduledISO,
    status: "active",
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
}

function normalizeTime(value: string | null | undefined) {
  if (!value) {
    return formatISO(new Date());
  }

  if (value.includes("T")) {
    return value;
  }

  const [hoursString, minutesString] = value.split(":");
  const hours = Number.parseInt(hoursString ?? "", 10);
  const minutes = Number.parseInt(minutesString ?? "", 10);
  const base = new Date();
  const nextDate = set(base, {
    hours: Number.isNaN(hours) ? base.getHours() : hours,
    minutes: Number.isNaN(minutes) ? 0 : minutes,
    seconds: 0,
    milliseconds: 0,
  });

  return formatISO(nextDate);
}
