import { serverApiClient } from "@/core/api/server-api-client";
import {
  deleteArticleFeaturedImage,
  toArticlesHttpResponse,
} from "@/features/articles/articles-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

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

  const { id } = await context.params;
  return toArticlesHttpResponse(
    await deleteArticleFeaturedImage(
      id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
