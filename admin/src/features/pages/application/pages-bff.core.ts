import { apiFailure, type ApiResponse } from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";

import {
  createPageInputSchema,
  laravelPageDetailResponseSchema,
  laravelPageListSchema,
  laravelPagePreviewResponseSchema,
  pageDetailResponseSchema,
  pageListQuerySchema,
  pageListSchema,
  pageMediaResponseSchema,
  pagePreviewResponseSchema,
  pageRevisionDetailResponseSchema,
  pageRevisionListSchema,
  savePageDraftInputSchema,
  type LaravelPageDetailResponse,
  type LaravelPageList,
  type LaravelPagePreviewResponse,
} from "../domain/pages.contracts";
import { buildPreviewUrl, buildPublicPageUrl } from "./pages-public-url.server";

export type PagesBffResponse = { status: number; body: object };
const auth = (token: string) => ({ authorization: `Bearer ${token}` });

function response(
  result: ApiResponse<unknown>,
  successStatus = 200,
): PagesBffResponse {
  return {
    status: result.success ? successStatus : (result.error.status ?? 503),
    body: result,
  };
}
function project<T, U>(
  result: ApiResponse<T>,
  projector: (data: T) => U,
): ApiResponse<U> {
  if (!result.success) return result;

  try {
    return { ...result, data: projector(result.data) };
  } catch {
    return apiFailure("INVALID_BACKEND_RESPONSE", { status: 502 });
  }
}
function projectPageList(result: ApiResponse<LaravelPageList>) {
  return project(result, (list) =>
    pageListSchema.parse({
      ...list,
      data: list.data.map((page) => ({
        ...page,
        public_url: buildPublicPageUrl(page.path),
      })),
    }),
  );
}
function projectPageDetail(result: ApiResponse<LaravelPageDetailResponse>) {
  return project(result, (response) =>
    pageDetailResponseSchema.parse({
      data: {
        ...response.data,
        public_url: buildPublicPageUrl(response.data.path),
      },
    }),
  );
}
function projectPreview(result: ApiResponse<LaravelPagePreviewResponse>) {
  return project(result, (response) =>
    pagePreviewResponseSchema.parse({
      data: {
        token: response.data.token,
        expires_at: response.data.expires_at,
        preview_url: buildPreviewUrl(response.data.token),
      },
    }),
  );
}
function failure(
  status: number,
  fieldErrors?: Record<string, string[]>,
): PagesBffResponse {
  return response(
    apiFailure(
      status === 401
        ? "AUTH_SESSION_EXPIRED"
        : status === 403
          ? "AUTH_FORBIDDEN"
          : "VALIDATION_FAILED",
      { status, ...(fieldErrors ? { fieldErrors } : {}) },
    ),
  );
}
function zodFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  return issues.reduce<Record<string, string[]>>((errors, issue) => {
    const key = issue.path.length ? issue.path.join(".") : "form";
    errors[key] = [...(errors[key] ?? []), issue.message];
    return errors;
  }, {});
}
function validId(id: string): string | null {
  return /^[1-9]\d*$/.test(id) ? id : null;
}
function uploadHeaders(request: Request): Headers {
  const headers = new Headers();
  for (const name of ["content-type", "content-length"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}
async function json(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function listPages(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<PagesBffResponse> {
  if (!token) return failure(401);
  const search = new URL(request.url).searchParams;
  const parsed = pageListQuerySchema.safeParse({
    ...(search.get("search") ? { search: search.get("search") } : {}),
    ...(search.get("status") ? { status: search.get("status") } : {}),
    ...(search.get("page") ? { page: search.get("page") } : {}),
    ...(search.get("per_page") ? { per_page: search.get("per_page") } : {}),
  });
  if (!parsed.success) return failure(422);
  return response(
    projectPageList(
      await client.request("/admin/pages", {
        ...auth(token),
        query: parsed.data,
        responseSchema: laravelPageListSchema,
        cache: "no-store",
      }),
    ),
  );
}
export async function getPage(
  id: string,
  client: ServerApiClient,
  token?: string,
  signal?: AbortSignal,
): Promise<PagesBffResponse> {
  if (!token) return failure(401);
  const pageId = validId(id);
  if (!pageId) return failure(404);
  return response(
    projectPageDetail(
      await client.request(`/admin/pages/${pageId}`, {
        ...auth(token),
        responseSchema: laravelPageDetailResponseSchema,
        cache: "no-store",
        ...(signal ? { signal } : {}),
      }),
    ),
  );
}
export async function deletePage(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<PagesBffResponse> {
  if (!token) return failure(401);
  const pageId = validId(id);
  if (!pageId) return failure(404);
  return response(
    await client.request(`/admin/pages/${pageId}`, {
      method: "DELETE",
      ...auth(token),
      cache: "no-store",
    }),
  );
}
export async function createPage(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<PagesBffResponse> {
  if (!token) return failure(401);
  const parsed = createPageInputSchema.safeParse(await json(request));
  if (!parsed.success) return failure(422);
  return response(
    projectPageDetail(
      await client.request("/admin/pages", {
        method: "POST",
        ...auth(token),
        body: parsed.data,
        responseSchema: laravelPageDetailResponseSchema,
        cache: "no-store",
      }),
    ),
    201,
  );
}
export async function saveDraft(
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<PagesBffResponse> {
  if (!token) return failure(401);
  const pageId = validId(id);
  if (!pageId) return failure(404);
  const parsed = savePageDraftInputSchema.safeParse(await json(request));
  if (!parsed.success) return failure(422, zodFieldErrors(parsed.error.issues));
  return response(
    projectPageDetail(
      await client.request(`/admin/pages/${pageId}/draft`, {
        method: "PUT",
        ...auth(token),
        body: parsed.data,
        responseSchema: laravelPageDetailResponseSchema,
        cache: "no-store",
      }),
    ),
  );
}
export async function lifecycle(
  id: string,
  action: "publish" | "archive" | "restore-from-archive",
  client: ServerApiClient,
  token?: string,
): Promise<PagesBffResponse> {
  if (!token) return failure(401);
  const pageId = validId(id);
  if (!pageId) return failure(404);
  return response(
    projectPageDetail(
      await client.request(`/admin/pages/${pageId}/${action}`, {
        method: "POST",
        ...auth(token),
        responseSchema: laravelPageDetailResponseSchema,
        cache: "no-store",
      }),
    ),
  );
}
export async function uploadMedia(
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<PagesBffResponse> {
  if (!token) return failure(401);
  const pageId = validId(id);
  if (!pageId || !request.body || !request.headers.has("content-type"))
    return failure(pageId ? 400 : 404);
  return response(
    await client.request(`/admin/pages/${pageId}/media`, {
      method: "POST",
      ...auth(token),
      headers: uploadHeaders(request),
      bodyStream: request.body,
      responseSchema: pageMediaResponseSchema,
      cache: "no-store",
      timeoutMs: 900_000,
    }),
    201,
  );
}
export async function createPreview(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<PagesBffResponse> {
  if (!token) return failure(401);
  const pageId = validId(id);
  if (!pageId) return failure(404);
  return response(
    projectPreview(
      await client.request(`/admin/pages/${pageId}/preview`, {
        method: "POST",
        ...auth(token),
        responseSchema: laravelPagePreviewResponseSchema,
        cache: "no-store",
      }),
    ),
    201,
  );
}
export async function revokePreview(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<PagesBffResponse> {
  if (!token) return failure(401);
  const pageId = validId(id);
  if (!pageId) return failure(404);
  return response(
    await client.request(`/admin/pages/${pageId}/preview`, {
      method: "DELETE",
      ...auth(token),
      cache: "no-store",
    }),
    204,
  );
}
export async function listRevisions(
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<PagesBffResponse> {
  if (!token) return failure(401);
  const pageId = validId(id);
  if (!pageId) return failure(404);
  const page = new URL(request.url).searchParams.get("page");
  return response(
    await client.request(`/admin/pages/${pageId}/revisions`, {
      ...auth(token),
      ...(page ? { query: { page } } : {}),
      responseSchema: pageRevisionListSchema,
      cache: "no-store",
    }),
  );
}
export async function getRevision(
  id: string,
  revision: string,
  client: ServerApiClient,
  token?: string,
): Promise<PagesBffResponse> {
  if (!token) return failure(401);
  const pageId = validId(id),
    revisionId = validId(revision);
  if (!pageId || !revisionId) return failure(404);
  return response(
    await client.request(`/admin/pages/${pageId}/revisions/${revisionId}`, {
      ...auth(token),
      responseSchema: pageRevisionDetailResponseSchema,
      cache: "no-store",
    }),
  );
}
export async function restoreRevision(
  id: string,
  revision: string,
  client: ServerApiClient,
  token?: string,
): Promise<PagesBffResponse> {
  if (!token) return failure(401);
  const pageId = validId(id),
    revisionId = validId(revision);
  if (!pageId || !revisionId) return failure(404);
  return response(
    projectPageDetail(
      await client.request(
        `/admin/pages/${pageId}/revisions/${revisionId}/restore`,
        {
          method: "POST",
          ...auth(token),
          responseSchema: laravelPageDetailResponseSchema,
          cache: "no-store",
        },
      ),
    ),
  );
}
export function toPagesHttpResponse(result: PagesBffResponse): Response {
  return Response.json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
}
