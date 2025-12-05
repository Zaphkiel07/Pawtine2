import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/database.types";
import { isSupabaseConfigured } from "@/lib/config";

const ALLOWED_PATHS = ["/profile", "/auth", "/logout"];

export async function middleware(req: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    ALLOWED_PATHS.some((allowed) => pathname.startsWith(allowed))
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return res;
  }

  const userId = session.user.id;

  const { data: userRow } = await supabase
    .from("users")
    .select("name")
    .eq("id", userId)
    .maybeSingle();

  const { data: dogRow } = await supabase
    .from("dogs")
    .select("name")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const isProfileComplete = Boolean(userRow?.name && dogRow?.name);

  if (!isProfileComplete) {
    const profileUrl = req.nextUrl.clone();
    profileUrl.pathname = "/profile";
    return NextResponse.redirect(profileUrl);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
