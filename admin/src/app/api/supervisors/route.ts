import { serverApiClient } from "@/core/api/server-api-client";
import {
  createSupervisor,
  listSupervisors,
  toSupervisorsHttpResponse,
} from "@/features/supervisors/supervisors-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  return toSupervisorsHttpResponse(
    await listSupervisors(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function POST(request: Request): Promise<Response> {
  if (!isSameOriginMutation(request))
    return toSupervisorsHttpResponse({
      status: 403,
      body: {
        success: false,
        error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
      },
    });
  return toSupervisorsHttpResponse(
    await createSupervisor(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
