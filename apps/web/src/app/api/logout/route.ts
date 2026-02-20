import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Log logout event BEFORE signing out (needs active session)
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (authUser) {
    const { data: profile } = await supabase
      .from("users")
      .select("id, tenant_id, email, full_name")
      .eq("auth_id", authUser.id)
      .single();

    if (profile) {
      await supabase.from("audit_logs").insert({
        tenant_id: profile.tenant_id,
        user_id: profile.id,
        user_email: profile.email,
        user_name: profile.full_name,
        action: "logout",
        resource: "user",
        resource_name: profile.email,
        metadata: {},
      });
    }
  }

  // Sign out from Supabase
  await supabase.auth.signOut();

  // Build redirect URL from request origin
  const url = new URL("/login", request.nextUrl.origin);
  const response = NextResponse.redirect(url);

  // Clear demo mode cookie (httpOnly, matching middleware settings)
  response.cookies.set("demo_mode", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });

  return response;
}
