import { serverApiClient } from "@/core/api/server-api-client";
import {
  getSystemContent,
  toSettingsHttpResponse,
  updateSystemContent,
} from "@/features/settings/settings-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ key: string }> },
): Promise<Response> {
  return toSettingsHttpResponse(
    await getSystemContent(
      (await context.params).key,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ key: string }> },
): Promise<Response> {
  if (!isSameOriginMutation(request))
    return toSettingsHttpResponse({
      status: 403,
      body: {
        success: false,
        error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
      },
    });
  return toSettingsHttpResponse(
    await updateSystemContent(
      (await context.params).key,
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
