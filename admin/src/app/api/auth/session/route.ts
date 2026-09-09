import {
  handleSession,
  toHttpResponse,
  unavailableAuthBffResponse,
} from "@/server/auth-bff/auth-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { getAuthBffRuntime } from "@/server/auth-bff/runtime";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const runtime = getAuthBffRuntime();
  if (!runtime.ok) {
    return toHttpResponse(unavailableAuthBffResponse(), false);
  }

  const { dependencies } = runtime;
  const result = await handleSession(
    dependencies,
    createAuthBffRequestContext(request),
  );

  return toHttpResponse(result, dependencies.isProduction);
}
