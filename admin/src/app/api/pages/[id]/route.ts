import { serverApiClient } from "@/core/api/server-api-client";
import {
  deletePage,
  getPage,
  toPagesHttpResponse,
} from "@/features/pages/application/pages-bff.core";
import { pagesModuleDisabledResponse } from "@/features/pages/application/pages-module-guard";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  const disabled = pagesModuleDisabledResponse();
  if (disabled) return disabled;
  const { id } = await context.params;
  return toPagesHttpResponse(
    await getPage(
      id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
      request.signal,
    ),
  );
}
export async function DELETE(request: Request, context: Context) {
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
    await deletePage(
      id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
