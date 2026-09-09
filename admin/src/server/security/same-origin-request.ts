import { verifyRequestOrigin } from "./origin-verification";

/** Enforces Origin on cookie-authenticated BFF mutations before any Laravel call. */
export function isSameOriginMutation(
  request: Request,
  canonicalOrigin: string | undefined = process.env.DASHBOARD_ORIGIN,
): boolean {
  return verifyRequestOrigin(request.headers.get("origin"), {
    requestOrigin: canonicalOrigin ?? new URL(request.url).origin,
  }).ok;
}
