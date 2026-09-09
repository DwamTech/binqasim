import { serverApiClient } from "@/core/api/server-api-client";
import {
  listRevisions,
  toPagesHttpResponse,
} from "@/features/pages/application/pages-bff.core";
import { pagesModuleDisabledResponse } from "@/features/pages/application/pages-module-guard";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  const disabled = pagesModuleDisabledResponse();
  if (disabled) return disabled;
  const { id } = await params;
  return toPagesHttpResponse(
    await listRevisions(
      id,
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
