import "server-only";

import { sessionCookieName } from "@/server/cookies/session-cookie";

import type { AuthBffRequestContext } from "./auth-bff.core";

export function createAuthBffRequestContext(
  request: Request,
): AuthBffRequestContext {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const session = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${sessionCookieName}=`));
  const encodedToken = session?.slice(sessionCookieName.length + 1);
  const forwardedFor = request.headers.get("x-forwarded-for");

  return {
    rateLimitKey: forwardedFor?.split(",")[0]?.trim() || "anonymous",
    ...(encodedToken === undefined || encodedToken === ""
      ? {}
      : { token: decodeURIComponent(encodedToken) }),
  };
}
