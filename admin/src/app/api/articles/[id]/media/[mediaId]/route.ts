import { serverApiClient } from "@/core/api/server-api-client";
import {
  deleteArticleMedia,
  toArticlesHttpResponse,
} from "@/features/articles/articles-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string; mediaId: string }> };

export async function DELETE(
  request: Request,
  context: Context,
): Promise<Response> {
  if (!isSameOriginMutation(request))
    return toArticlesHttpResponse({
      status: 403,
      body: {
        success: false,
        error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
      },
    });
  const { id, mediaId } = await context.params;
  return toArticlesHttpResponse(
    await deleteArticleMedia(
      id,
      mediaId,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
