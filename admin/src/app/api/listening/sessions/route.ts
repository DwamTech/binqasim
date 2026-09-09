import { serverApiClient } from "@/core/api/server-api-client";
import {
  createListeningSessionBff,
  listListeningSessionsBff,
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
    await listListeningSessionsBff(
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
    await createListeningSessionBff(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
