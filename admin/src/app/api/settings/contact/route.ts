import { serverApiClient } from "@/core/api/server-api-client";
import {
  getContact,
  toSettingsHttpResponse,
  updateContact,
} from "@/features/settings/settings-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  return toSettingsHttpResponse(
    await getContact(
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function PUT(request: Request): Promise<Response> {
  if (!isSameOriginMutation(request))
    return toSettingsHttpResponse({
      status: 403,
      body: {
        success: false,
        error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
      },
    });
  return toSettingsHttpResponse(
    await updateContact(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
