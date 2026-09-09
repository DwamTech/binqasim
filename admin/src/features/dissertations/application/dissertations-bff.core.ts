import { apiFailure, type ApiResponse } from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import {
  dissertationDeleteResponseSchema,
  dissertationDetailResponseSchema,
  dissertationMutationResponseSchema,
  dissertationPageSchema,
  dissertationQuerySchema,
} from "../domain/dissertations.schemas";

export type DissertationsBffResponse = { status: number; body: object };

const auth = (token: string) => ({ authorization: `Bearer ${token}` });

function response(
  result: ApiResponse<unknown>,
  successStatus = 200,
): DissertationsBffResponse {
  return {
    status: result.success ? successStatus : (result.error.status ?? 503),
    body: result,
  };
}

function failure(status: number): DissertationsBffResponse {
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
  return /^[A-Za-z0-9_-]{1,100}$/.test(id) ? id : null;
}

async function formData(request: Request): Promise<FormData | null> {
  try {
    return await request.formData();
  } catch {
    return null;
  }
}

export async function listDissertations(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<DissertationsBffResponse> {
  if (!token) return failure(401);
  const search = new URL(request.url).searchParams;
  const parsed = dissertationQuerySchema.safeParse(
    Object.fromEntries(search.entries()),
  );
  if (!parsed.success) return failure(422);
  return response(
    await client.request("/admin/dissertations", {
      ...auth(token),
      query: parsed.data,
      responseSchema: dissertationPageSchema,
      cache: "no-store",
    }),
  );
}

export async function getDissertation(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<DissertationsBffResponse> {
  if (!token) return failure(401);
  const dissertationId = validId(id);
  if (!dissertationId) return failure(404);
  return response(
    await client.request(`/admin/dissertations/${dissertationId}`, {
      ...auth(token),
      responseSchema: dissertationDetailResponseSchema,
      cache: "no-store",
    }),
  );
}

export async function createDissertation(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<DissertationsBffResponse> {
  if (!token) return failure(401);
  const body = await formData(request);
  if (!body) return failure(400);
  return response(
    await client.request("/admin/dissertations", {
      method: "POST",
      ...auth(token),
      body,
      responseSchema: dissertationMutationResponseSchema,
      cache: "no-store",
      timeoutMs: 120_000,
    }),
    201,
  );
}

export async function updateDissertation(
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<DissertationsBffResponse> {
  if (!token) return failure(401);
  const dissertationId = validId(id);
  if (!dissertationId) return failure(404);
  const body = await formData(request);
  if (!body) return failure(400);
  return response(
    await client.request(`/admin/dissertations/${dissertationId}`, {
      method: "POST",
      multipartMethodOverride: "PATCH",
      ...auth(token),
      body,
      responseSchema: dissertationMutationResponseSchema,
      cache: "no-store",
      timeoutMs: 120_000,
    }),
  );
}

export async function deleteDissertation(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<DissertationsBffResponse> {
  if (!token) return failure(401);
  const dissertationId = validId(id);
  if (!dissertationId) return failure(404);
  return response(
    await client.request(`/admin/dissertations/${dissertationId}`, {
      method: "DELETE",
      ...auth(token),
      responseSchema: dissertationDeleteResponseSchema,
      cache: "no-store",
    }),
  );
}

export function toDissertationsHttpResponse(
  result: DissertationsBffResponse,
): Response {
  return Response.json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
}
