import { serverApiClient } from "@/core/api/server-api-client";
import {
  toJoinApplicationsHttpResponse,
  updateJoinApplicationStatus,
} from "@/features/join-applications/join-applications-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

type Context = { params: Promise<{ type: string; id: string }> };

export async function PATCH(
  request: Request,
  context: Context,
): Promise<Response> {
  if (!isSameOriginMutation(request)) {
    return Response.json({ success: false }, { status: 403 });
  }
  const { type, id } = await context.params;
  return toJoinApplicationsHttpResponse(
    await updateJoinApplicationStatus(
      type,
      id,
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
