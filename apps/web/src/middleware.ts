import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth(function middleware(req) {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Protect all /dashboard/* routes
  if (pathname.startsWith("/dashboard")) {
    if (!session?.user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if ((pathname === "/login" || pathname === "/signup") && session?.user) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
