import { serverApiClient } from "@/core/api/server-api-client";
import {
  getCommentOptionsBff,
  toCommentsHttpResponse,
} from "@/features/comments/application/comments-bff.core";
import { disabledCommentsResponse } from "@/features/comments/application/comments-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export async function GET(request: Request): Promise<Response> {
  const disabled = disabledCommentsResponse();
  if (disabled) return disabled;
  return toCommentsHttpResponse(
    await getCommentOptionsBff(
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
