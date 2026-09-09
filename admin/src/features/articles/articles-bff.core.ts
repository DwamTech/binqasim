import {
  apiFailure,
  apiSuccess,
  type ApiResponse,
} from "../../core/api/api-response";
import type { ServerApiClient } from "../../core/api/server-api-client.core";
import {
  articleAuthorsResponseSchema,
  articleCatalogsSchema,
  articleDeleteResponseSchema,
  articleDetailResponseSchema,
  articleMutationResponseSchema,
  articlePageSchema,
  articleQuerySchema,
  articleSectionsResponseSchema,
  articleToggleResponseSchema,
} from "./articles.contracts";

export type ArticlesBffResponse = { status: number; body: object };

function response(
  result: ApiResponse<unknown>,
  successStatus = 200,
): ArticlesBffResponse {
  return {
    status: result.success ? successStatus : (result.error.status ?? 503),
    body: result,
  };
}

function failure(status: number): ArticlesBffResponse {
  const code =
    status === 401
      ? "AUTH_SESSION_EXPIRED"
      : status === 403
        ? "AUTH_FORBIDDEN"
        : status === 429
          ? "RATE_LIMIT_EXCEEDED"
          : "VALIDATION_FAILED";
  return { status, body: apiFailure(code, { status }) };
}

function validId(id: string): string | null {
  return /^[1-9]\d*$/.test(id) ? id : null;
}

function uploadHeaders(request: Request): Headers {
  const headers = new Headers();
  for (const name of [
    "content-type",
    "content-length",
    "x-article-trace-id",
  ]) {
    const value = request.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  return headers;
}

const auth = (token: string) => ({ authorization: `Bearer ${token}` });

export async function listArticles(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<ArticlesBffResponse> {
  if (!token) return failure(401);
  const search = new URL(request.url).searchParams;
  const parsed = articleQuerySchema.safeParse({
    ...(search.get("search") ? { search: search.get("search") } : {}),
    ...(search.get("section_id")
      ? { section_id: search.get("section_id") }
      : {}),
    ...(search.get("status") ? { status: search.get("status") } : {}),
    ...(search.get("author") ? { author: search.get("author") } : {}),
    ...(search.get("date") ? { date: search.get("date") } : {}),
    ...(search.get("page") ? { page: search.get("page") } : {}),
    ...(search.get("per_page") ? { per_page: search.get("per_page") } : {}),
  });
  if (!parsed.success) return failure(422);

  return response(
    await client.request("/admin/articles", {
      ...auth(token),
      query: parsed.data,
      responseSchema: articlePageSchema,
      cache: "no-store",
    }),
  );
}

export async function getArticle(
  id: string,
  client: ServerApiClient,
  token?: string,
  signal?: AbortSignal,
): Promise<ArticlesBffResponse> {
  if (!token) return failure(401);
  const articleId = validId(id);
  if (!articleId) return failure(404);
  return response(
    await client.request(`/admin/articles/${articleId}`, {
      ...auth(token),
      responseSchema: articleDetailResponseSchema,
      cache: "no-store",
      ...(signal ? { signal } : {}),
    }),
  );
}

export async function createArticle(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<ArticlesBffResponse> {
  if (!token) return failure(401);
  if (!request.body || !request.headers.has("content-type"))
    return failure(400);
  return response(
    await client.request("/articles", {
      method: "POST",
      ...auth(token),
      headers: uploadHeaders(request),
      bodyStream: request.body,
      responseSchema: articleMutationResponseSchema,
      cache: "no-store",
      timeoutMs: 900_000,
    }),
    201,
  );
}

export async function updateArticle(
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<ArticlesBffResponse> {
  if (!token) return failure(401);
  const articleId = validId(id);
  if (!articleId) return failure(404);
  if (!request.body || !request.headers.has("content-type"))
    return failure(400);
  return response(
    await client.request(`/articles/${articleId}`, {
      method: "POST",
      query: { _method: "PUT" },
      ...auth(token),
      headers: uploadHeaders(request),
      bodyStream: request.body,
      responseSchema: articleMutationResponseSchema,
      cache: "no-store",
      timeoutMs: 900_000,
    }),
  );
}

export async function deleteArticle(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<ArticlesBffResponse> {
  if (!token) return failure(401);
  const articleId = validId(id);
  if (!articleId) return failure(404);
  return response(
    await client.request(`/articles/${articleId}`, {
      method: "DELETE",
      ...auth(token),
      responseSchema: articleDeleteResponseSchema,
      cache: "no-store",
    }),
  );
}

export async function deleteArticleMedia(
  articleIdValue: string,
  mediaIdValue: string,
  client: ServerApiClient,
  token?: string,
): Promise<ArticlesBffResponse> {
  if (!token) return failure(401);
  const articleId = validId(articleIdValue);
  const mediaId = validId(mediaIdValue);
  if (!articleId || !mediaId) return failure(404);
  return response(
    await client.request(`/articles/${articleId}/media/${mediaId}`, {
      method: "DELETE",
      ...auth(token),
      responseSchema: articleDeleteResponseSchema,
      cache: "no-store",
    }),
  );
}

export async function deleteArticleFeaturedImage(
  articleIdValue: string,
  client: ServerApiClient,
  token?: string,
): Promise<ArticlesBffResponse> {
  if (!token) return failure(401);
  const articleId = validId(articleIdValue);
  if (!articleId) return failure(404);
  return response(
    await client.request(`/articles/${articleId}/featured-image`, {
      method: "DELETE",
      ...auth(token),
      responseSchema: articleDeleteResponseSchema,
      cache: "no-store",
    }),
  );
}

export async function toggleArticleStatus(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<ArticlesBffResponse> {
  if (!token) return failure(401);
  const articleId = validId(id);
  if (!articleId) return failure(404);
  return response(
    await client.request(`/articles/${articleId}/toggle-status`, {
      method: "POST",
      ...auth(token),
      responseSchema: articleToggleResponseSchema,
      cache: "no-store",
    }),
  );
}

export async function getArticleCatalogs(
  client: ServerApiClient,
  token?: string,
): Promise<ArticlesBffResponse> {
  if (!token) return failure(401);
  const [sections, authors] = await Promise.all([
    client.request("/sections", {
      query: { module: "articles" },
      responseSchema: articleSectionsResponseSchema,
      cache: "no-store",
    }),
    client.request("/admin/articles/authors", {
      ...auth(token),
      responseSchema: articleAuthorsResponseSchema,
      cache: "no-store",
    }),
  ]);
  if (!sections.success) return response(sections);
  if (!authors.success) return response(authors);
  return response(
    apiSuccess(
      articleCatalogsSchema.parse({
        sections: sections.data,
        authors: authors.data.data,
      }),
    ),
  );
}

export function toArticlesHttpResponse(result: ArticlesBffResponse): Response {
  return Response.json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
}
