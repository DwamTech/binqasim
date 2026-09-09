import { serverApiClient } from "@/core/api/server-api-client";
import {
  getFatwaInboxDetailBff,
  toFatwaInboxHttpResponse,
} from "@/features/scientific-fatwas/application/fatwa-inbox-bff.core";
import { disabledScientificFatwasResponse } from "@/features/scientific-fatwas/application/scientific-fatwas-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  context: Context,
): Promise<Response> {
  const disabled = disabledScientificFatwasResponse();
  if (disabled) return disabled;
  return toFatwaInboxHttpResponse(
    await getFatwaInboxDetailBff(
      (await context.params).id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
