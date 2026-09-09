import { serverApiClient } from "@/core/api/server-api-client";
import {
  createPreview,
  revokePreview,
  toPagesHttpResponse,
} from "@/features/pages/application/pages-bff.core";
import { pagesModuleDisabledResponse } from "@/features/pages/application/pages-module-guard";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

type Context = { params: Promise<{ id: string }> };
function invalidOrigin() {
  return Response.json(
    {
      success: false,
      error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
    },
    { status: 403 },
  );
}
export async function POST(request: Request, context: Context) {
  const disabled = pagesModuleDisabledResponse();
  if (disabled) return disabled;
  if (!isSameOriginMutation(request)) return invalidOrigin();
  const { id } = await context.params;
  return toPagesHttpResponse(
    await createPreview(
      id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
export async function DELETE(request: Request, context: Context) {
  const disabled = pagesModuleDisabledResponse();
  if (disabled) return disabled;
  if (!isSameOriginMutation(request)) return invalidOrigin();
  const { id } = await context.params;
  return toPagesHttpResponse(
    await revokePreview(
      id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
