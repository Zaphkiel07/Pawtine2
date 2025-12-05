"use server";

import { redirect } from "next/navigation";
import { runOnboarding } from "@/lib/onboarding";
import { formatISO, set } from "date-fns";

export async function submitOnboarding(formData: FormData) {
  const dogName = String(formData.get("dogName"));
  const dogBreed = formData.get("dogBreed")?.toString() || undefined;
  const timezone = formData.get("timezone")?.toString() || undefined;
  const morningFeed = formData.get("morningFeed")?.toString() || "07:30";
  const eveningFeed = formData.get("eveningFeed")?.toString() || "18:30";
  const walksPerDay = Number(formData.get("walksPerDay") ?? 2);

  const toIsoTime = (time: string, hoursFallback: number) => {
    const [hoursString, minutesString] = time.split(":");
    const hours = Number.parseInt(hoursString || "", 10);
    const minutes = Number.parseInt(minutesString || "", 10);
    const base = new Date();
    const scheduled = set(base, {
      hours: Number.isNaN(hours) ? hoursFallback : hours,
      minutes: Number.isNaN(minutes) ? 0 : minutes,
      seconds: 0,
      milliseconds: 0,
    });

    return formatISO(scheduled);
  };

  const routines: Array<{
    type: "feed" | "walk" | "water" | "custom";
    label: string;
    scheduled_time: string;
  }> = [
    {
      type: "feed" as const,
      label: `${dogName} breakfast`,
      scheduled_time: toIsoTime(morningFeed, 7),
    },
    {
      type: "feed" as const,
      label: `${dogName} dinner`,
      scheduled_time: toIsoTime(eveningFeed, 18),
    },
    {
      type: "water" as const,
      label: `${dogName} water refresh`,
      scheduled_time: toIsoTime("09:00", 9),
    },
  ];

  for (let index = 0; index < walksPerDay; index += 1) {
    routines.push({
      type: "walk",
      label: `${dogName} walk #${index + 1}`,
      scheduled_time: toIsoTime(`${14 + index}:00`, 14 + index),
    });
  }

  await runOnboarding({
    dogName,
    dogBreed,
    timezone,
    routines,
  });

  redirect("/");
}
