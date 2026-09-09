import { apiFailure, type ApiResponse } from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import {
  fatwaInboxDetailSchema,
  fatwaInboxMutationSchema,
  fatwaInboxPageSchema,
  fatwaInboxQuerySchema,
  fatwaInboxSummarySchema,
} from "../domain/fatwa-inbox.schemas";

export type FatwaInboxBffResponse = { status: number; body: object };
const auth = (token: string) => ({ authorization: `Bearer ${token}` });

function response(
  result: ApiResponse<unknown>,
  successStatus = 200,
): FatwaInboxBffResponse {
  return {
    status: result.success ? successStatus : (result.error.status ?? 503),
    body: result,
  };
}

function failure(status: number): FatwaInboxBffResponse {
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

export async function listFatwaInboxBff(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<FatwaInboxBffResponse> {
  if (!token) return failure(401);
  const parsed = fatwaInboxQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams.entries()),
  );
  if (!parsed.success) return failure(422);
  return response(
    await client.request("/admin/fatwas", {
      ...auth(token),
      query: parsed.data,
      responseSchema: fatwaInboxPageSchema,
      cache: "no-store",
    }),
  );
}

export async function getFatwaInboxSummaryBff(
  client: ServerApiClient,
  token?: string,
): Promise<FatwaInboxBffResponse> {
  if (!token) return failure(401);
  return response(
    await client.request("/admin/fatwas/summary", {
      ...auth(token),
      responseSchema: fatwaInboxSummarySchema,
      cache: "no-store",
    }),
  );
}

export async function getFatwaInboxDetailBff(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<FatwaInboxBffResponse> {
  if (!token) return failure(401);
  const resourceId = validId(id);
  if (!resourceId) return failure(404);
  return response(
    await client.request(`/admin/fatwas/${resourceId}`, {
      ...auth(token),
      responseSchema: fatwaInboxDetailSchema,
      cache: "no-store",
    }),
  );
}

async function answerMutation(
  id: string,
  request: Request,
  method: "POST" | "PUT",
  client: ServerApiClient,
  token?: string,
): Promise<FatwaInboxBffResponse> {
  if (!token) return failure(401);
  const resourceId = validId(id);
  if (!resourceId) return failure(404);
  const body = await readJson(request);
  if (!body) return failure(400);
  return response(
    await client.request(`/admin/fatwas/${resourceId}/answer`, {
      method,
      ...auth(token),
      body,
      responseSchema: fatwaInboxMutationSchema,
      cache: "no-store",
    }),
  );
}

export function answerFatwaInboxBff(
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
) {
  return answerMutation(id, request, "POST", client, token);
}

export function updateFatwaInboxAnswerBff(
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
) {
  return answerMutation(id, request, "PUT", client, token);
}

async function stateMutation(
  id: string,
  action: "archive" | "restore",
  client: ServerApiClient,
  token?: string,
): Promise<FatwaInboxBffResponse> {
  if (!token) return failure(401);
  const resourceId = validId(id);
  if (!resourceId) return failure(404);
  return response(
    await client.request(`/admin/fatwas/${resourceId}/${action}`, {
      method: "POST",
      ...auth(token),
      responseSchema: fatwaInboxMutationSchema,
      cache: "no-store",
    }),
  );
}

export function archiveFatwaInboxBff(
  id: string,
  client: ServerApiClient,
  token?: string,
) {
  return stateMutation(id, "archive", client, token);
}

export function restoreFatwaInboxBff(
  id: string,
  client: ServerApiClient,
  token?: string,
) {
  return stateMutation(id, "restore", client, token);
}

export function toFatwaInboxHttpResponse(result: FatwaInboxBffResponse) {
  return Response.json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
}
