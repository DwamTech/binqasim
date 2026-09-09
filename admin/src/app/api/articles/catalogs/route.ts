import { serverApiClient } from "@/core/api/server-api-client";
import {
  getArticleCatalogs,
  toArticlesHttpResponse,
} from "@/features/articles/articles-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  return toArticlesHttpResponse(
    await getArticleCatalogs(
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
