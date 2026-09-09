import { NextResponse, type NextRequest } from "next/server";

import { sessionCookieName } from "./server/cookies/session-cookie";
import { getRoutePolicyDecision } from "./server/routing/route-policy";
import { safeRedirect } from "./server/routing/safe-redirect";

export function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const decision = getRoutePolicyDecision(
    nextUrl.pathname,
    request.cookies.has(sessionCookieName),
  );

  if (decision.action === "next") {
    return NextResponse.next();
  }

  if (decision.destination === "/dashboard") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const loginUrl = new URL("/login", request.url);
  const returnTo = safeRedirect(`${nextUrl.pathname}${nextUrl.search}`, {
    currentPath: "/login",
    fallback: "/dashboard",
  });
  loginUrl.searchParams.set("next", returnTo);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
