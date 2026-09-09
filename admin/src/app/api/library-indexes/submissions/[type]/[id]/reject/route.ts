import { serverApiClient } from "@/core/api/server-api-client";
import { serverEnv } from "@/core/env/server";
import {
  reviewLibraryIndexSubmissionBff,
  toLibraryIndexesHttpResponse,
} from "@/features/library-indexes/application/library-indexes-bff.core";
import {
  unavailableLibraryIndexesResponse,
  unsafeLibraryIndexesMutationResponse,
} from "@/features/library-indexes/application/library-indexes-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ type: string; id: string }> },
): Promise<Response> {
  const unavailable = unavailableLibraryIndexesResponse();
  if (unavailable) return unavailable;
  const unsafe = unsafeLibraryIndexesMutationResponse(request);
  if (unsafe) return unsafe;
  const { type, id } = await context.params;
  return toLibraryIndexesHttpResponse(
    await reviewLibraryIndexSubmissionBff(
      type,
      id,
      "reject",
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
      serverEnv.BACKEND_API_URL,
    ),
  );
}
