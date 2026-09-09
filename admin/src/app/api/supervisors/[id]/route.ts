import { serverApiClient } from "@/core/api/server-api-client";
import {
  deleteSupervisor,
  getSupervisor,
  toSupervisorsHttpResponse,
  updateSupervisor,
} from "@/features/supervisors/supervisors-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  context: Context,
): Promise<Response> {
  return toSupervisorsHttpResponse(
    await getSupervisor(
      (await context.params).id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function PATCH(
  request: Request,
  context: Context,
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
    await updateSupervisor(
      (await context.params).id,
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function DELETE(
  request: Request,
  context: Context,
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
    await deleteSupervisor(
      (await context.params).id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
