import { serverApiClient } from "@/core/api/server-api-client";
import {
  bulkDeleteCommentsBff,
  toCommentsHttpResponse,
} from "@/features/comments/application/comments-bff.core";
import {
  disabledCommentsResponse,
  invalidCommentsOriginResponse,
} from "@/features/comments/application/comments-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export async function POST(request: Request): Promise<Response> {
  const disabled = disabledCommentsResponse();
  if (disabled) return disabled;
  if (!isSameOriginMutation(request)) return invalidCommentsOriginResponse();
  return toCommentsHttpResponse(
    await bulkDeleteCommentsBff(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
