import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) {
    return NextResponse.json({ ok: true });
  }

  try {
    const { password } = await request.json();
    if (password !== sitePassword) {
      return NextResponse.json({ error: "Буруу нууц үг" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set("site-auth", sitePassword, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
