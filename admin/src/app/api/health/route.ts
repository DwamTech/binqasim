import { handleHealth, toHttpResponse } from "@/server/auth-bff/auth-bff.core";
import { getAuthBffRuntime } from "@/server/auth-bff/runtime";

export const runtime = "nodejs";

export function GET(): Response {
  const runtime = getAuthBffRuntime();
  return toHttpResponse(
    handleHealth(),
    runtime.ok && runtime.dependencies.isProduction,
  );
}
