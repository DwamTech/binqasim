import { serverApiClient } from "@/core/api/server-api-client";
import {
  createScientificFatwaBff,
  listScientificFatwasBff,
  toScientificFatwaHttpResponse,
} from "@/features/scientific-fatwas/application/scientific-fatwas-bff.core";
import {
  disabledScientificFatwasResponse,
  unsafeScientificFatwaMutationResponse,
} from "@/features/scientific-fatwas/application/scientific-fatwas-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const disabled = disabledScientificFatwasResponse();
  if (disabled) return disabled;
  return toScientificFatwaHttpResponse(
    await listScientificFatwasBff(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function POST(request: Request): Promise<Response> {
  const disabled = disabledScientificFatwasResponse();
  if (disabled) return disabled;
  const unsafe = unsafeScientificFatwaMutationResponse(request);
  if (unsafe) return unsafe;
  return toScientificFatwaHttpResponse(
    await createScientificFatwaBff(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
