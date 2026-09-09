import type { ApiErrorCode } from "@/core/api/api-response";
import type { AdminSummary } from "@/features/auth/domain/auth.contracts";

export type ServerAuthState =
  | { status: "authenticated"; admin: AdminSummary }
  | { status: "unauthenticated"; reason: "missing" | "invalid" | "forbidden" }
  | {
      status: "unavailable";
      reason: "admin_unavailable" | "runtime_unavailable";
    };

type AdminLookup = { getCurrentAdmin(token: string): Promise<AdminSummary> };

export async function loadServerAuthState(
  token: string | undefined,
  repository: AdminLookup | undefined,
): Promise<ServerAuthState> {
  if (token === undefined || token === "")
    return { status: "unauthenticated", reason: "missing" };
  if (repository === undefined)
    return { status: "unavailable", reason: "runtime_unavailable" };
  try {
    return {
      status: "authenticated",
      admin: await repository.getCurrentAdmin(token),
    };
  } catch (error) {
    const candidate = error as { code?: ApiErrorCode; status?: number };
    if (candidate.status === 401 || candidate.code === "AUTH_SESSION_EXPIRED")
      return { status: "unauthenticated", reason: "invalid" };
    if (candidate.status === 403 || candidate.code === "AUTH_FORBIDDEN")
      return { status: "unauthenticated", reason: "forbidden" };
    return { status: "unavailable", reason: "admin_unavailable" };
  }
}
