import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SITE_PASSWORD = process.env.SITE_PASSWORD;

export function middleware(request: NextRequest) {
  if (!SITE_PASSWORD) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;
  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const auth = request.cookies.get("site-auth")?.value;
  if (auth === SITE_PASSWORD) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
