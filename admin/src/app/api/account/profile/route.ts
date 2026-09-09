import { serverApiClient } from "@/core/api/server-api-client";
import {
  handleProfileUpdate,
  toAccountHttpResponse,
} from "@/server/account-bff/account-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";

export async function PATCH(request: Request): Promise<Response> {
  if (!isSameOriginMutation(request)) {
    return Response.json(
      {
        success: false,
        error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
      },
      { status: 403, headers: { "cache-control": "no-store" } },
    );
  }

  return toAccountHttpResponse(
    await handleProfileUpdate(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
