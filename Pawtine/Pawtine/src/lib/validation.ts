import { z } from "zod";

export const routineTypeSchema = z.enum(["feed", "walk", "water", "custom"]);

export const createRoutineSchema = z.object({
  type: routineTypeSchema,
  label: z.string({ required_error: "Label is required" }).min(1, "Label is required").max(120),
  scheduled_time: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
      message: "Invalid scheduled time",
    }),
});

export const updateRoutineSchema = createRoutineSchema.extend({
  status: z.enum(["active", "paused"]),
});

export const calendarRoutineSchema = z.object({
  date: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date"),
  time: z.string().regex(/^[0-2]\d:[0-5]\d$/, "Invalid time format"),
  label: z.string().min(1).max(120),
  type: routineTypeSchema.default("custom"),
});

export const profileSchema = z.object({
  userName: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined),
  timezone: z.string().optional(),
  dogName: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined),
  dogBreed: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined),
  dogAgeMonths: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      const parsed = Number.parseInt(value, 10);
      return Number.isNaN(parsed) ? undefined : parsed;
    }),
});

export function formDataToObject(formData: FormData) {
  const result: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") {
      result[key] = value;
    }
  });
  return result;
}

