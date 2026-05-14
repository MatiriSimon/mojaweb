// `middleware.ts` (at project root, next to `app/`)

import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";


export async function middleware(request: NextRequest) {
  return await updateSession(request);
}


export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static, _next/image, favicon.ico
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};