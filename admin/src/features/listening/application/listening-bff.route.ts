import "server-only";

import { isDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";
import { isSameOriginMutation } from "@/server/security/same-origin-request";
import { toListeningHttpResponse } from "./listening-bff.core";

export function disabledListeningModuleResponse(): Response | null {
  return isDashboardModuleEnabled("listening")
    ? null
    : Response.json(
        {
          success: false,
          error: { code: "AUTH_FORBIDDEN", message: "Module is disabled." },
        },
        { status: 404, headers: { "cache-control": "no-store" } },
      );
}

export function unsafeListeningMutationResponse(request: Request): Response | null {
  return isSameOriginMutation(request)
    ? null
    : toListeningHttpResponse({
        status: 403,
        body: {
          success: false,
          error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
        },
      });
}
