import { safeRedirect } from "./safe-redirect";

export type RootRouteState = { authenticated: boolean };

export function getRootRouteDestination(
  state: RootRouteState,
): "/dashboard" | "/login" {
  const destination = state.authenticated ? "/dashboard" : "/login";

  return safeRedirect(destination, {
    currentPath: "/",
    fallback: "/login",
  }) as "/dashboard" | "/login";
}
