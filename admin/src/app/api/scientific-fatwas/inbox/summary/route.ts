import { serverApiClient } from "@/core/api/server-api-client";
import {
  getFatwaInboxSummaryBff,
  toFatwaInboxHttpResponse,
} from "@/features/scientific-fatwas/application/fatwa-inbox-bff.core";
import { disabledScientificFatwasResponse } from "@/features/scientific-fatwas/application/scientific-fatwas-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const disabled = disabledScientificFatwasResponse();
  if (disabled) return disabled;
  return toFatwaInboxHttpResponse(
    await getFatwaInboxSummaryBff(
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
