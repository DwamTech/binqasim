import { serverApiClient } from "@/core/api/server-api-client";
import {
  createArticle,
  listArticles,
  toArticlesHttpResponse,
} from "@/features/articles/articles-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request): Promise<Response> {
  return toArticlesHttpResponse(
    await listArticles(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function POST(request: Request): Promise<Response> {
  if (!isSameOriginMutation(request))
    return toArticlesHttpResponse({
      status: 403,
      body: {
        success: false,
        error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
      },
    });
  return toArticlesHttpResponse(
    await createArticle(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
