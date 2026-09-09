import "server-only";

import { isDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";
import { isSameOriginMutation } from "@/server/security/same-origin-request";
import { toHadithCardsHttpResponse } from "./hadith-cards-bff.core";

export function disabledHadithCardsModuleResponse(): Response | null {
  return isDashboardModuleEnabled("hadithCards")
    ? null
    : Response.json(
        {
          success: false,
          error: { code: "AUTH_FORBIDDEN", message: "Module is disabled." },
        },
        { status: 404, headers: { "cache-control": "no-store" } },
      );
}

export function unsafeHadithCardsMutationResponse(
  request: Request,
): Response | null {
  return isSameOriginMutation(request)
    ? null
    : toHadithCardsHttpResponse({
        status: 403,
        body: {
          success: false,
          error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
        },
      });
}
