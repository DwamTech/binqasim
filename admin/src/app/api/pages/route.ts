import { serverApiClient } from "@/core/api/server-api-client";
import {
  createPage,
  listPages,
  toPagesHttpResponse,
} from "@/features/pages/application/pages-bff.core";
import { pagesModuleDisabledResponse } from "@/features/pages/application/pages-module-guard";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";
export async function GET(request: Request) {
  const disabled = pagesModuleDisabledResponse();
  if (disabled) return disabled;
  return toPagesHttpResponse(
    await listPages(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
export async function POST(request: Request) {
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
  return toPagesHttpResponse(
    await createPage(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
