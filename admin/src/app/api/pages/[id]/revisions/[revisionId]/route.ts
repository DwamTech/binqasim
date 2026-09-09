import { serverApiClient } from "@/core/api/server-api-client";
import {
  getRevision,
  toPagesHttpResponse,
} from "@/features/pages/application/pages-bff.core";
import { pagesModuleDisabledResponse } from "@/features/pages/application/pages-module-guard";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

type Context = { params: Promise<{ id: string; revisionId: string }> };

export async function GET(request: Request, { params }: Context) {
  const disabled = pagesModuleDisabledResponse();
  if (disabled) return disabled;
  const { id, revisionId } = await params;
  return toPagesHttpResponse(
    await getRevision(
      id,
      revisionId,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
