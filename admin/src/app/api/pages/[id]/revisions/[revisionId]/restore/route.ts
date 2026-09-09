import { serverApiClient } from "@/core/api/server-api-client";
import {
  restoreRevision,
  toPagesHttpResponse,
} from "@/features/pages/application/pages-bff.core";
import { pagesModuleDisabledResponse } from "@/features/pages/application/pages-module-guard";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

type Context = { params: Promise<{ id: string; revisionId: string }> };

export async function POST(request: Request, { params }: Context) {
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
  const { id, revisionId } = await params;
  return toPagesHttpResponse(
    await restoreRevision(
      id,
      revisionId,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
