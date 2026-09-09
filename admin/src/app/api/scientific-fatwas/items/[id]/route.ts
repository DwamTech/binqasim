import { serverApiClient } from "@/core/api/server-api-client";
import {
  deleteScientificFatwaBff,
  getScientificFatwaBff,
  toScientificFatwaHttpResponse,
  updateScientificFatwaBff,
} from "@/features/scientific-fatwas/application/scientific-fatwas-bff.core";
import {
  disabledScientificFatwasResponse,
  unsafeScientificFatwaMutationResponse,
} from "@/features/scientific-fatwas/application/scientific-fatwas-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  context: Context,
): Promise<Response> {
  const disabled = disabledScientificFatwasResponse();
  if (disabled) return disabled;
  return toScientificFatwaHttpResponse(
    await getScientificFatwaBff(
      (await context.params).id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function PATCH(
  request: Request,
  context: Context,
): Promise<Response> {
  const disabled = disabledScientificFatwasResponse();
  if (disabled) return disabled;
  const unsafe = unsafeScientificFatwaMutationResponse(request);
  if (unsafe) return unsafe;
  return toScientificFatwaHttpResponse(
    await updateScientificFatwaBff(
      (await context.params).id,
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function DELETE(
  request: Request,
  context: Context,
): Promise<Response> {
  const disabled = disabledScientificFatwasResponse();
  if (disabled) return disabled;
  const unsafe = unsafeScientificFatwaMutationResponse(request);
  if (unsafe) return unsafe;
  return toScientificFatwaHttpResponse(
    await deleteScientificFatwaBff(
      (await context.params).id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
