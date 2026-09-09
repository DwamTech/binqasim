import { serverApiClient } from "@/core/api/server-api-client";
import {
  deleteScientificFatwaCategoryBff,
  toScientificFatwaHttpResponse,
  updateScientificFatwaCategoryBff,
} from "@/features/scientific-fatwas/application/scientific-fatwas-bff.core";
import {
  disabledScientificFatwasResponse,
  unsafeScientificFatwaMutationResponse,
} from "@/features/scientific-fatwas/application/scientific-fatwas-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function PATCH(
  request: Request,
  context: Context,
): Promise<Response> {
  const disabled = disabledScientificFatwasResponse();
  if (disabled) return disabled;
  const unsafe = unsafeScientificFatwaMutationResponse(request);
  if (unsafe) return unsafe;
  return toScientificFatwaHttpResponse(
    await updateScientificFatwaCategoryBff(
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
    await deleteScientificFatwaCategoryBff(
      (await context.params).id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
