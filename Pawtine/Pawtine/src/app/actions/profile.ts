"use server";

import { revalidatePath } from "next/cache";
import { updateProfile } from "@/lib/profile";
import { formDataToObject, profileSchema } from "@/lib/validation";

export async function updateProfileAction(formData: FormData) {
  const parsed = profileSchema.parse(formDataToObject(formData));

  await updateProfile({
    userName: parsed.userName,
    timezone: parsed.timezone,
    dogName: parsed.dogName,
    dogBreed: parsed.dogBreed,
    dogAgeMonths: parsed.dogAgeMonths ?? null,
  });

  revalidatePath("/profile");
  revalidatePath("/");
  revalidatePath("/", "layout");
}
