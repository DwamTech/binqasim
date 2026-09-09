import { apiFailure, type ApiResponse } from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import {
  scientificFatwaCategoriesResponseSchema,
  scientificFatwaCategoryMutationSchema,
  scientificFatwaDeleteSchema,
  scientificFatwaDetailSchema,
  scientificFatwaMutationSchema,
  scientificFatwaPageSchema,
  scientificFatwaQuerySchema,
} from "../domain/scientific-fatwas.schemas";

export type ScientificFatwaBffResponse = { status: number; body: object };
const auth = (token: string) => ({ authorization: `Bearer ${token}` });

function response(
  result: ApiResponse<unknown>,
  successStatus = 200,
): ScientificFatwaBffResponse {
  return {
    status: result.success ? successStatus : (result.error.status ?? 503),
    body: result,
  };
}

function failure(status: number): ScientificFatwaBffResponse {
  const code =
    status === 401
      ? "AUTH_SESSION_EXPIRED"
      : status === 403
        ? "AUTH_FORBIDDEN"
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

async function readJson(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    const value: unknown = await request.json();
    return typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export async function listScientificFatwasBff(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<ScientificFatwaBffResponse> {
  if (!token) return failure(401);
  const parsed = scientificFatwaQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams.entries()),
  );
  if (!parsed.success) return failure(422);
  return response(
    await client.request("/admin/scientific-fatwas/items", {
      ...auth(token),
      query: parsed.data,
      responseSchema: scientificFatwaPageSchema,
      cache: "no-store",
    }),
  );
}

export async function getScientificFatwaBff(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<ScientificFatwaBffResponse> {
  if (!token) return failure(401);
  const resourceId = validId(id);
  if (!resourceId) return failure(404);
  return response(
    await client.request(`/admin/scientific-fatwas/items/${resourceId}`, {
      ...auth(token),
      responseSchema: scientificFatwaDetailSchema,
      cache: "no-store",
    }),
  );
}

export async function createScientificFatwaBff(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<ScientificFatwaBffResponse> {
  if (!token) return failure(401);
  const body = await readFormData(request);
  if (!body) return failure(400);
  return response(
    await client.request("/admin/scientific-fatwas/items", {
      method: "POST",
      ...auth(token),
      body,
      responseSchema: scientificFatwaMutationSchema,
      cache: "no-store",
    }),
    201,
  );
}

export async function updateScientificFatwaBff(
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<ScientificFatwaBffResponse> {
  if (!token) return failure(401);
  const resourceId = validId(id);
  if (!resourceId) return failure(404);
  const body = await readFormData(request);
  if (!body) return failure(400);
  return response(
    await client.request(`/admin/scientific-fatwas/items/${resourceId}`, {
      method: "POST",
      multipartMethodOverride: "PATCH",
      ...auth(token),
      body,
      responseSchema: scientificFatwaMutationSchema,
      cache: "no-store",
    }),
  );
}

export async function deleteScientificFatwaBff(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<ScientificFatwaBffResponse> {
  if (!token) return failure(401);
  const resourceId = validId(id);
  if (!resourceId) return failure(404);
  return response(
    await client.request(`/admin/scientific-fatwas/items/${resourceId}`, {
      method: "DELETE",
      ...auth(token),
      responseSchema: scientificFatwaDeleteSchema,
      cache: "no-store",
    }),
  );
}

export async function listScientificFatwaCategoriesBff(
  client: ServerApiClient,
  token?: string,
): Promise<ScientificFatwaBffResponse> {
  if (!token) return failure(401);
  return response(
    await client.request("/admin/scientific-fatwas/categories", {
      ...auth(token),
      responseSchema: scientificFatwaCategoriesResponseSchema,
      cache: "no-store",
    }),
  );
}

export async function createScientificFatwaCategoryBff(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<ScientificFatwaBffResponse> {
  if (!token) return failure(401);
  const body = await readJson(request);
  if (!body) return failure(400);
  return response(
    await client.request("/admin/scientific-fatwas/categories", {
      method: "POST",
      ...auth(token),
      body,
      responseSchema: scientificFatwaCategoryMutationSchema,
      cache: "no-store",
    }),
    201,
  );
}

export async function updateScientificFatwaCategoryBff(
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<ScientificFatwaBffResponse> {
  if (!token) return failure(401);
  const categoryId = validId(id);
  if (!categoryId) return failure(404);
  const body = await readJson(request);
  if (!body) return failure(400);
  return response(
    await client.request(`/admin/scientific-fatwas/categories/${categoryId}`, {
      method: "PATCH",
      ...auth(token),
      body,
      responseSchema: scientificFatwaCategoryMutationSchema,
      cache: "no-store",
    }),
  );
}

export async function deleteScientificFatwaCategoryBff(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<ScientificFatwaBffResponse> {
  if (!token) return failure(401);
  const categoryId = validId(id);
  if (!categoryId) return failure(404);
  return response(
    await client.request(`/admin/scientific-fatwas/categories/${categoryId}`, {
      method: "DELETE",
      ...auth(token),
      responseSchema: scientificFatwaDeleteSchema,
      cache: "no-store",
    }),
  );
}

export function toScientificFatwaHttpResponse(
  result: ScientificFatwaBffResponse,
): Response {
  return Response.json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
}
