import "server-only";

import { serverEnv } from "@/core/env/server";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

function errorResponse(status: number, message: string): Response {
  return Response.json(
    {
      success: false,
      error: {
        code: status === 403 ? "AUTH_FORBIDDEN" : "UNKNOWN_ERROR",
        message,
      },
    },
    { status, headers: { "cache-control": "no-store" } },
  );
}

export function unavailableLibraryIndexesResponse(): Response | null {
  return serverEnv.DASHBOARD_MODULE_LIBRARY_INDEXES_ENABLED
    ? null
    : errorResponse(404, "Module is disabled for this deployment.");
}

export function unsafeLibraryIndexesMutationResponse(
  request: Request,
): Response | null {
  return isSameOriginMutation(request)
    ? null
    : errorResponse(403, "Invalid request origin.");
}
