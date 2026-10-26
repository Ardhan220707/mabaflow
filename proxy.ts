import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/beranda/:path*",
    "/ai/:path*",
    "/tugas/:path*",
    "/kalender/:path*",
    "/profil/:path*",
    "/login",
    "/register",
  ],
};
