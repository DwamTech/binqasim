import { serverApiClient } from "@/core/api/server-api-client";
import {
  toPagesHttpResponse,
  uploadMedia,
} from "@/features/pages/application/pages-bff.core";
import { pagesModuleDisabledResponse } from "@/features/pages/application/pages-module-guard";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";
export const runtime = "nodejs";
export const maxDuration = 300;
type Context = { params: Promise<{ id: string }> };
export async function POST(request: Request, context: Context) {
  const disabled = pagesModuleDisabledResponse();
  if (disabled) return disabled;
  if (!isSameOriginMutation(request))
    return Response.json(
      {
        success: false,
        error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
      },
      { status: 403 },
    );
  const { id } = await context.params;
  return toPagesHttpResponse(
    await uploadMedia(
      id,
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
