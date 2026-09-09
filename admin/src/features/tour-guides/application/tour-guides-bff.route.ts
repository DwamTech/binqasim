import "server-only";

import { isDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";

export function disabledTourGuidesResponse(): Response | null {
  return isDashboardModuleEnabled("tourGuides")
    ? null
    : Response.json(
        {
          success: false,
          error: { code: "AUTH_FORBIDDEN", message: "Module is disabled." },
        },
        { status: 404, headers: { "cache-control": "no-store" } },
      );
}

export function invalidTourGuidesOriginResponse(): Response {
  return Response.json(
    {
      success: false,
      error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
    },
    { status: 403, headers: { "cache-control": "no-store" } },
  );
}
