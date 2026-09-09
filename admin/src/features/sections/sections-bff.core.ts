import { apiFailure, type ApiResponse } from "../../core/api/api-response";
import type { ServerApiClient } from "../../core/api/server-api-client.core";
import {
  sectionDeleteResponseSchema,
  sectionFormSchema,
  sectionMutationResponseSchema,
  sectionPageSchema,
  sectionQuerySchema,
  sectionSchema,
} from "./sections.contracts";

export type SectionsBffResponse = {
  status: number;
  body: object;
};

function response(result: ApiResponse<unknown>): SectionsBffResponse {
  return {
    status: result.success ? 200 : (result.error.status ?? 503),
    body: result,
  };
}

function failure(status: number): SectionsBffResponse {
  const code =
    status === 401
      ? "AUTH_SESSION_EXPIRED"
      : status === 403
        ? "AUTH_FORBIDDEN"
        : "VALIDATION_FAILED";
  return { status, body: apiFailure(code, { status }) };
}

async function json(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

function validId(id: string): string | null {
  return /^[1-9]\d*$/.test(id) ? id : null;
}

export async function listSections(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<SectionsBffResponse> {
  if (!token) return failure(401);
  const url = new URL(request.url);
  const query = sectionQuerySchema.safeParse({
    ...(url.searchParams.get("search")
      ? { search: url.searchParams.get("search") }
      : {}),
    ...(url.searchParams.get("module")
      ? { module: url.searchParams.get("module") }
      : {}),
    ...(url.searchParams.get("page")
      ? { page: url.searchParams.get("page") }
      : {}),
  });
  if (!query.success) return failure(422);

  return response(
    await client.request("/admin/sections", {
      authorization: `Bearer ${token}`,
      query: query.data,
      responseSchema: sectionPageSchema,
      cache: "no-store",
    }),
  );
}

export async function createSection(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<SectionsBffResponse> {
  if (!token) return failure(401);
  const input = sectionFormSchema.safeParse(await json(request));
  if (!input.success) return failure(422);

  const result = await client.request("/admin/sections", {
    method: "POST",
    authorization: `Bearer ${token}`,
    body: input.data,
    responseSchema: sectionMutationResponseSchema,
    cache: "no-store",
  });
  const mapped = response(result);
  if (result.success) mapped.status = 201;
  return mapped;
}

export async function getSection(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<SectionsBffResponse> {
  if (!token) return failure(401);
  const sectionId = validId(id);
  if (!sectionId) return failure(422);

  return response(
    await client.request(`/admin/sections/${sectionId}`, {
      authorization: `Bearer ${token}`,
      responseSchema: sectionSchema,
      cache: "no-store",
    }),
  );
}

export async function updateSection(
  request: Request,
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<SectionsBffResponse> {
  if (!token) return failure(401);
  const sectionId = validId(id);
  if (!sectionId) return failure(422);
  const input = sectionFormSchema.safeParse(await json(request));
  if (!input.success) return failure(422);

  return response(
    await client.request(`/admin/sections/${sectionId}`, {
      method: "PATCH",
      authorization: `Bearer ${token}`,
      body: input.data,
      responseSchema: sectionMutationResponseSchema,
      cache: "no-store",
    }),
  );
}

export async function deleteSection(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<SectionsBffResponse> {
  if (!token) return failure(401);
  const sectionId = validId(id);
  if (!sectionId) return failure(422);

  return response(
    await client.request(`/admin/sections/${sectionId}`, {
      method: "DELETE",
      authorization: `Bearer ${token}`,
      responseSchema: sectionDeleteResponseSchema,
      cache: "no-store",
    }),
  );
}

export function toSectionsHttpResponse(result: SectionsBffResponse): Response {
  return Response.json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
}
