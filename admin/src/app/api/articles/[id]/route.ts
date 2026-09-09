import { serverApiClient } from "@/core/api/server-api-client";
import {
  deleteArticle,
  getArticle,
  toArticlesHttpResponse,
  updateArticle,
} from "@/features/articles/articles-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";
export const maxDuration = 300;

type Context = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  context: Context,
): Promise<Response> {
  const { id } = await context.params;
  return toArticlesHttpResponse(
    await getArticle(
      id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
      request.signal,
    ),
  );
}

export async function PATCH(
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
    await updateArticle(
      id,
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
    await deleteArticle(
      id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
