import { serverApiClient } from "@/core/api/server-api-client";
import {
  createListeningSeriesBff,
  listListeningSeriesBff,
  toListeningHttpResponse,
} from "@/features/listening/application/listening-bff.core";
import {
  disabledListeningModuleResponse,
  unsafeListeningMutationResponse,
} from "@/features/listening/application/listening-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(request: Request): Promise<Response> {
  const disabled = disabledListeningModuleResponse();
  if (disabled) return disabled;
  return toListeningHttpResponse(
    await listListeningSeriesBff(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function POST(request: Request): Promise<Response> {
  const disabled = disabledListeningModuleResponse();
  if (disabled) return disabled;
  const unsafe = unsafeListeningMutationResponse(request);
  if (unsafe) return unsafe;
  return toListeningHttpResponse(
    await createListeningSeriesBff(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
