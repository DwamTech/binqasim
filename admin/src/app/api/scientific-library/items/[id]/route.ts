import { serverApiClient } from "@/core/api/server-api-client";
import {
  deleteScientificLibraryItem,
  getScientificLibraryItem,
  toScientificLibraryHttpResponse,
  updateScientificLibraryItem,
} from "@/features/scientific-library/application/scientific-library-bff.core";
import {
  disabledScientificLibraryResponse,
  invalidScientificLibraryOriginResponse,
} from "@/features/scientific-library/application/scientific-library-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";
export const maxDuration = 120;

type Context = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  context: Context,
): Promise<Response> {
  const disabled = disabledScientificLibraryResponse();
  if (disabled) return disabled;
  return toScientificLibraryHttpResponse(
    await getScientificLibraryItem(
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
  const disabled = disabledScientificLibraryResponse();
  if (disabled) return disabled;
  if (!isSameOriginMutation(request))
    return invalidScientificLibraryOriginResponse();
  return toScientificLibraryHttpResponse(
    await updateScientificLibraryItem(
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
  const disabled = disabledScientificLibraryResponse();
  if (disabled) return disabled;
  if (!isSameOriginMutation(request))
    return invalidScientificLibraryOriginResponse();
  return toScientificLibraryHttpResponse(
    await deleteScientificLibraryItem(
      (await context.params).id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
