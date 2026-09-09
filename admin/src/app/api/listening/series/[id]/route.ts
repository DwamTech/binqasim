import { serverApiClient } from "@/core/api/server-api-client";
import {
  deleteListeningSeriesBff,
  getListeningSeriesBff,
  toListeningHttpResponse,
  updateListeningSeriesBff,
} from "@/features/listening/application/listening-bff.core";
import {
  disabledListeningModuleResponse,
  unsafeListeningMutationResponse,
} from "@/features/listening/application/listening-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export const runtime = "nodejs";
export const maxDuration = 120;

type Context = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  context: Context,
): Promise<Response> {
  const disabled = disabledListeningModuleResponse();
  if (disabled) return disabled;
  return toListeningHttpResponse(
    await getListeningSeriesBff(
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
  const disabled = disabledListeningModuleResponse();
  if (disabled) return disabled;
  const unsafe = unsafeListeningMutationResponse(request);
  if (unsafe) return unsafe;
  return toListeningHttpResponse(
    await updateListeningSeriesBff(
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
  const disabled = disabledListeningModuleResponse();
  if (disabled) return disabled;
  const unsafe = unsafeListeningMutationResponse(request);
  if (unsafe) return unsafe;
  return toListeningHttpResponse(
    await deleteListeningSeriesBff(
      (await context.params).id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
