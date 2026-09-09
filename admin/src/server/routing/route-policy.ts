export const guestOnlyRoutes = ["/login"] as const;
export const protectedRoutes = ["/dashboard"] as const;

export type RoutePolicyDecision =
  | { action: "next" }
  | {
      action: "redirect";
      destination: "/dashboard" | "/login";
    };

function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

export function getRoutePolicyDecision(
  pathname: string,
  hasSessionCookie: boolean,
): RoutePolicyDecision {
  if (isStaticAsset(pathname)) {
    return { action: "next" };
  }

  if (
    !hasSessionCookie &&
    protectedRoutes.some((route) => matchesRoute(pathname, route))
  ) {
    return { action: "redirect", destination: "/login" };
  }

  if (
    hasSessionCookie &&
    guestOnlyRoutes.some((route) => matchesRoute(pathname, route))
  ) {
    return { action: "redirect", destination: "/dashboard" };
  }

  return { action: "next" };
}
