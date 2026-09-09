import { serverApiClient } from "@/core/api/server-api-client";
import {
  listJoinApplications,
  saveJoinApplication,
  toJoinApplicationsHttpResponse,
} from "@/features/join-applications/join-applications-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

type Context = { params: Promise<{ type: string }> };

export async function GET(
  request: Request,
  context: Context,
): Promise<Response> {
  const { type } = await context.params;
  return toJoinApplicationsHttpResponse(
    await listJoinApplications(
      type,
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function POST(
  request: Request,
  context: Context,
): Promise<Response> {
  if (!isSameOriginMutation(request)) {
    return Response.json({ success: false }, { status: 403 });
  }
  const { type } = await context.params;
  return toJoinApplicationsHttpResponse(
    await saveJoinApplication(
      type,
      null,
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
