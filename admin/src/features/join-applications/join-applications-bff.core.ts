import { apiFailure, type ApiResponse } from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import {
  isJoinApplicationType,
  joinApplicationPageSchema,
  joinApplicationQuerySchema,
  joinApplicationSchema,
  joinApplicationStatusSchema,
} from "./join-applications.contracts";

export type JoinApplicationsBffResponse = { status: number; body: object };

const auth = (token: string) => ({ authorization: `Bearer ${token}` });

function response(
  result: ApiResponse<unknown>,
  successStatus = 200,
): JoinApplicationsBffResponse {
  return {
    status: result.success ? successStatus : (result.error.status ?? 503),
    body: result,
  };
}

function failure(status: number): JoinApplicationsBffResponse {
  return {
    status,
    body: apiFailure(
      status === 401
        ? "AUTH_SESSION_EXPIRED"
        : status === 403
          ? "AUTH_FORBIDDEN"
          : "VALIDATION_FAILED",
      { status },
    ),
  };
}

function validId(value: string): string | null {
  return /^[1-9]\d*$/.test(value) ? value : null;
}

export async function listJoinApplications(
  type: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<JoinApplicationsBffResponse> {
  if (!token) return failure(401);
  if (!isJoinApplicationType(type)) return failure(404);
  const search = new URL(request.url).searchParams;
  const parsed = joinApplicationQuerySchema.safeParse({
    ...(search.get("status") ? { status: search.get("status") } : {}),
    ...(search.get("search") ? { search: search.get("search") } : {}),
    ...(search.get("date_from") ? { date_from: search.get("date_from") } : {}),
    ...(search.get("date_to") ? { date_to: search.get("date_to") } : {}),
    page: search.get("page") ?? 1,
    per_page: search.get("per_page") ?? 15,
  });
  if (!parsed.success) return failure(422);
  return response(
    await client.request(`/admin/join-applications/${type}`, {
      ...auth(token),
      query: parsed.data,
      responseSchema: joinApplicationPageSchema,
      cache: "no-store",
    }),
  );
}

export async function getJoinApplication(
  type: string,
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<JoinApplicationsBffResponse> {
  if (!token) return failure(401);
  if (!isJoinApplicationType(type)) return failure(404);
  const valid = validId(id);
  if (!valid) return failure(404);
  return response(
    await client.request(`/admin/join-applications/${type}/${valid}`, {
      ...auth(token),
      responseSchema: joinApplicationSchema,
      cache: "no-store",
    }),
  );
}

export async function saveJoinApplication(
  type: string,
  id: string | null,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<JoinApplicationsBffResponse> {
  if (!token) return failure(401);
  if (!isJoinApplicationType(type)) return failure(404);
  if (id !== null && !validId(id)) return failure(404);
  let body: FormData;
  try {
    body = await request.formData();
  } catch {
    return failure(422);
  }
  const path = `/admin/join-applications/${type}${id ? `/${id}` : ""}`;
  return response(
    await client.request(path, {
      method: "POST",
      ...(id ? { multipartMethodOverride: "PATCH" as const } : {}),
      ...auth(token),
      body,
      responseSchema: joinApplicationSchema,
      cache: "no-store",
    }),
    id ? 200 : 201,
  );
}

export async function updateJoinApplicationStatus(
  type: string,
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<JoinApplicationsBffResponse> {
  if (!token) return failure(401);
  if (!isJoinApplicationType(type) || !validId(id)) return failure(404);
  const body = await request.json().catch(() => null);
  const parsed = joinApplicationStatusSchema.safeParse(
    typeof body === "object" && body ? Reflect.get(body, "status") : null,
  );
  if (!parsed.success) return failure(422);
  const adminNote =
    typeof body === "object" && body
      ? Reflect.get(body, "admin_note")
      : undefined;
  return response(
    await client.request(`/admin/join-applications/${type}/${id}/status`, {
      method: "PATCH",
      ...auth(token),
      body: {
        status: parsed.data,
        ...(typeof adminNote === "string" ? { admin_note: adminNote } : {}),
      },
      responseSchema: joinApplicationSchema,
      cache: "no-store",
    }),
  );
}

export async function deleteJoinApplication(
  type: string,
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<JoinApplicationsBffResponse> {
  if (!token) return failure(401);
  if (!isJoinApplicationType(type) || !validId(id)) return failure(404);
  return response(
    await client.request(`/admin/join-applications/${type}/${id}`, {
      method: "DELETE",
      ...auth(token),
      cache: "no-store",
    }),
  );
}

export function toJoinApplicationsHttpResponse(
  result: JoinApplicationsBffResponse,
): Response {
  return Response.json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
}
