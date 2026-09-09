import "server-only";

import { isDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";
import { isSameOriginMutation } from "@/server/security/same-origin-request";
import { toScientificFatwaHttpResponse } from "./scientific-fatwas-bff.core";

export function disabledScientificFatwasResponse(): Response | null {
  return isDashboardModuleEnabled("scientificFatwas")
    ? null
    : Response.json(
        {
          success: false,
          error: { code: "AUTH_FORBIDDEN", message: "Module is disabled." },
        },
        { status: 404, headers: { "cache-control": "no-store" } },
      );
}

export function unsafeScientificFatwaMutationResponse(
  request: Request,
): Response | null {
  return isSameOriginMutation(request)
    ? null
    : toScientificFatwaHttpResponse({
        status: 403,
        body: {
          success: false,
          error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
        },
      });
}
