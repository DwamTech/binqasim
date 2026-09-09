import { serverApiClient } from "@/core/api/server-api-client";
import {
  changeSupervisorPassword,
  toSupervisorsHttpResponse,
} from "@/features/supervisors/supervisors-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!isSameOriginMutation(request))
    return toSupervisorsHttpResponse({
      status: 403,
      body: {
        success: false,
        error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
      },
    });
  return toSupervisorsHttpResponse(
    await changeSupervisorPassword(
      (await context.params).id,
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
