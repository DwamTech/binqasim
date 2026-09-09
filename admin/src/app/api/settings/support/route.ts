import { serverApiClient } from "@/core/api/server-api-client";
import {
  getSupport,
  toSettingsHttpResponse,
  updateSupport,
} from "@/features/settings/settings-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  return toSettingsHttpResponse(
    await getSupport(
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function POST(request: Request): Promise<Response> {
  if (!isSameOriginMutation(request))
    return toSettingsHttpResponse({
      status: 403,
      body: {
        success: false,
        error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
      },
    });
  return toSettingsHttpResponse(
    await updateSupport(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
