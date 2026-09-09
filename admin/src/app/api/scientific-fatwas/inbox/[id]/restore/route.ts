import { serverApiClient } from "@/core/api/server-api-client";
import {
  restoreFatwaInboxBff,
  toFatwaInboxHttpResponse,
} from "@/features/scientific-fatwas/application/fatwa-inbox-bff.core";
import {
  disabledScientificFatwasResponse,
  unsafeScientificFatwaMutationResponse,
} from "@/features/scientific-fatwas/application/scientific-fatwas-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function POST(
  request: Request,
  context: Context,
): Promise<Response> {
  const disabled = disabledScientificFatwasResponse();
  if (disabled) return disabled;
  const unsafe = unsafeScientificFatwaMutationResponse(request);
  if (unsafe) return unsafe;
  return toFatwaInboxHttpResponse(
    await restoreFatwaInboxBff(
      (await context.params).id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
