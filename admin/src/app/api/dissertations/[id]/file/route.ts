import { serverEnv } from "@/core/env/server";
import { proxyDissertationFile } from "@/features/dissertations/application/dissertation-file-proxy";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  context: Context,
): Promise<Response> {
  if (!isDashboardModuleEnabled("dissertations")) {
    return Response.json(
      {
        success: false,
        error: { code: "AUTH_FORBIDDEN", message: "Module is disabled." },
      },
      { status: 404, headers: { "cache-control": "no-store" } },
    );
  }

  return proxyDissertationFile(
    (await context.params).id,
    request,
    createAuthBffRequestContext(request).token,
    {
      backendApiUrl: serverEnv.BACKEND_API_URL,
      fetch: globalThis.fetch,
    },
  );
}
