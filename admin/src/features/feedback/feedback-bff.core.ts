import { apiFailure, type ApiResponse } from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import {
  feedbackItemSchema,
  feedbackPageSchema,
  feedbackQuerySchema,
  feedbackStatusUpdateSchema,
} from "./feedback.contracts";

export type FeedbackBffResponse = { status: number; body: object };

const auth = (token: string) => ({ authorization: `Bearer ${token}` });

function response(result: ApiResponse<unknown>): FeedbackBffResponse {
  return {
    status: result.success ? 200 : (result.error.status ?? 503),
    body: result,
  };
}

function failure(status: number): FeedbackBffResponse {
  const code =
    status === 401
      ? "AUTH_SESSION_EXPIRED"
      : status === 403
        ? "AUTH_FORBIDDEN"
        : "VALIDATION_FAILED";
  return { status, body: apiFailure(code, { status }) };
}

function validId(value: string): string | null {
  return /^[1-9]\d*$/.test(value) ? value : null;
}

export async function listFeedback(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<FeedbackBffResponse> {
  if (!token) return failure(401);
  const search = new URL(request.url).searchParams;
  const parsed = feedbackQuerySchema.safeParse({
    type: search.get("type") ?? "complaint",
    ...(search.get("status") ? { status: search.get("status") } : {}),
    ...(search.get("search") ? { search: search.get("search") } : {}),
    page: search.get("page") ?? 1,
    per_page: search.get("per_page") ?? 15,
  });
  if (!parsed.success) return failure(422);
  return response(
    await client.request("/admin/feedback-submissions", {
      ...auth(token),
      query: parsed.data,
      responseSchema: feedbackPageSchema,
      cache: "no-store",
    }),
  );
}

export async function getFeedback(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<FeedbackBffResponse> {
  if (!token) return failure(401);
  const feedbackId = validId(id);
  if (!feedbackId) return failure(404);
  return response(
    await client.request(`/admin/feedback-submissions/${feedbackId}`, {
      ...auth(token),
      responseSchema: feedbackItemSchema,
      cache: "no-store",
    }),
  );
}

export async function updateFeedbackStatus(
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<FeedbackBffResponse> {
  if (!token) return failure(401);
  const feedbackId = validId(id);
  if (!feedbackId) return failure(404);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return failure(400);
  }
  const parsed = feedbackStatusUpdateSchema
    .pick({ status: true, admin_note: true })
    .partial({ admin_note: true })
    .safeParse(body);
  if (!parsed.success) return failure(422);
  return response(
    await client.request(`/admin/feedback-submissions/${feedbackId}/status`, {
      method: "PATCH",
      ...auth(token),
      body: parsed.data,
      responseSchema: feedbackItemSchema,
      cache: "no-store",
    }),
  );
}

export function toFeedbackHttpResponse(result: FeedbackBffResponse): Response {
  return Response.json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
}
