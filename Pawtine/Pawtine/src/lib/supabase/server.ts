import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/database.types";
import { isSupabaseConfigured } from "@/lib/config";

export const createServerSupabaseClient = () => {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase environment variables are not configured for this runtime.",
    );
  }

  return createServerComponentClient<Database>({
    cookies,
  });
};
