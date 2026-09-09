import { apiFailure, type ApiResponse } from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import {
  listeningDeleteSchema,
  listeningSeriesDetailSchema,
  listeningSeriesMutationSchema,
  listeningSeriesPageSchema,
  listeningSeriesQuerySchema,
  listeningSessionDetailSchema,
  listeningSessionMutationSchema,
  listeningSessionPageSchema,
  listeningSessionQuerySchema,
} from "../domain/listening.schemas";

export type ListeningBffResponse = { status: number; body: object };

const auth = (token: string) => ({ authorization: `Bearer ${token}` });

function response(
  result: ApiResponse<unknown>,
  successStatus = 200,
): ListeningBffResponse {
  return {
    status: result.success ? successStatus : (result.error.status ?? 503),
    body: result,
  };
}

function failure(status: number): ListeningBffResponse {
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
  return /^\d+$/.test(id) ? id : null;
}

async function readFormData(request: Request): Promise<FormData | null> {
  try {
    return await request.formData();
  } catch {
    return null;
  }
}

function parsedQuery(
  request: Request,
  schema: typeof listeningSeriesQuerySchema | typeof listeningSessionQuerySchema,
) {
  return schema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams.entries()),
  );
}

export async function listListeningSeriesBff(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<ListeningBffResponse> {
  if (!token) return failure(401);
  const parsed = parsedQuery(request, listeningSeriesQuerySchema);
  if (!parsed.success) return failure(422);
  return response(
    await client.request("/admin/listening/series", {
      ...auth(token),
      query: parsed.data,
      responseSchema: listeningSeriesPageSchema,
      cache: "no-store",
    }),
  );
}

export async function getListeningSeriesBff(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<ListeningBffResponse> {
  if (!token) return failure(401);
  const resourceId = validId(id);
  if (!resourceId) return failure(404);
  return response(
    await client.request(`/admin/listening/series/${resourceId}`, {
      ...auth(token),
      responseSchema: listeningSeriesDetailSchema,
      cache: "no-store",
    }),
  );
}

export async function createListeningSeriesBff(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<ListeningBffResponse> {
  if (!token) return failure(401);
  const body = await readFormData(request);
  if (!body) return failure(400);
  return response(
    await client.request("/admin/listening/series", {
      method: "POST",
      ...auth(token),
      body,
      responseSchema: listeningSeriesMutationSchema,
      cache: "no-store",
      timeoutMs: 120_000,
    }),
    201,
  );
}

export async function updateListeningSeriesBff(
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<ListeningBffResponse> {
  if (!token) return failure(401);
  const resourceId = validId(id);
  if (!resourceId) return failure(404);
  const body = await readFormData(request);
  if (!body) return failure(400);
  return response(
    await client.request(`/admin/listening/series/${resourceId}`, {
      method: "POST",
      multipartMethodOverride: "PATCH",
      ...auth(token),
      body,
      responseSchema: listeningSeriesMutationSchema,
      cache: "no-store",
      timeoutMs: 120_000,
    }),
  );
}

export async function deleteListeningSeriesBff(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<ListeningBffResponse> {
  if (!token) return failure(401);
  const resourceId = validId(id);
  if (!resourceId) return failure(404);
  return response(
    await client.request(`/admin/listening/series/${resourceId}`, {
      method: "DELETE",
      ...auth(token),
      responseSchema: listeningDeleteSchema,
      cache: "no-store",
    }),
  );
}

export async function listListeningSessionsBff(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<ListeningBffResponse> {
  if (!token) return failure(401);
  const parsed = parsedQuery(request, listeningSessionQuerySchema);
  if (!parsed.success) return failure(422);
  return response(
    await client.request("/admin/listening/sessions", {
      ...auth(token),
      query: parsed.data,
      responseSchema: listeningSessionPageSchema,
      cache: "no-store",
    }),
  );
}

export async function getListeningSessionBff(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<ListeningBffResponse> {
  if (!token) return failure(401);
  const resourceId = validId(id);
  if (!resourceId) return failure(404);
  return response(
    await client.request(`/admin/listening/sessions/${resourceId}`, {
      ...auth(token),
      responseSchema: listeningSessionDetailSchema,
      cache: "no-store",
    }),
  );
}

export async function createListeningSessionBff(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<ListeningBffResponse> {
  if (!token) return failure(401);
  const body = await readFormData(request);
  if (!body) return failure(400);
  return response(
    await client.request("/admin/listening/sessions", {
      method: "POST",
      ...auth(token),
      body,
      responseSchema: listeningSessionMutationSchema,
      cache: "no-store",
      timeoutMs: 120_000,
    }),
    201,
  );
}

export async function updateListeningSessionBff(
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<ListeningBffResponse> {
  if (!token) return failure(401);
  const resourceId = validId(id);
  if (!resourceId) return failure(404);
  const body = await readFormData(request);
  if (!body) return failure(400);
  return response(
    await client.request(`/admin/listening/sessions/${resourceId}`, {
      method: "POST",
      multipartMethodOverride: "PATCH",
      ...auth(token),
      body,
      responseSchema: listeningSessionMutationSchema,
      cache: "no-store",
      timeoutMs: 120_000,
    }),
  );
}

export async function deleteListeningSessionBff(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<ListeningBffResponse> {
  if (!token) return failure(401);
  const resourceId = validId(id);
  if (!resourceId) return failure(404);
  return response(
    await client.request(`/admin/listening/sessions/${resourceId}`, {
      method: "DELETE",
      ...auth(token),
      responseSchema: listeningDeleteSchema,
      cache: "no-store",
    }),
  );
}

export function toListeningHttpResponse(result: ListeningBffResponse): Response {
  return Response.json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
}
