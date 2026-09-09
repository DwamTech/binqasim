import { serverApiClient } from "@/core/api/server-api-client";
import {
  approveCommentBff,
  toCommentsHttpResponse,
} from "@/features/comments/application/comments-bff.core";
import {
  disabledCommentsResponse,
  invalidCommentsOriginResponse,
} from "@/features/comments/application/comments-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

type Context = { params: Promise<{ id: string }> };

export async function POST(
  request: Request,
  context: Context,
): Promise<Response> {
  const disabled = disabledCommentsResponse();
  if (disabled) return disabled;
  if (!isSameOriginMutation(request)) return invalidCommentsOriginResponse();
  return toCommentsHttpResponse(
    await approveCommentBff(
      (await context.params).id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
