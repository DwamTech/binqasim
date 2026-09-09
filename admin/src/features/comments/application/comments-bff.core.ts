import {
  apiFailure,
  type ApiErrorCode,
  type ApiResponse,
} from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import {
  bulkDeleteCommentsSchema,
  commentDeleteResponseSchema,
  commentDetailSchema,
  commentOptionsSchema,
  commentsPageSchema,
  commentsStatsSchema,
  commentsQuerySchema,
} from "../domain/comments.schemas";
import { commentsBackendEndpoints } from "../infrastructure/comments.endpoints";
import {
  commentsQueryFromSearchParams,
  commentsQueryToBackend,
} from "../infrastructure/comments.query";

export type CommentsBffResponse = { status: number; body: object };

const auth = (token: string) => ({ authorization: `Bearer ${token}` });

function response(
  result: ApiResponse<unknown>,
  successStatus = 200,
): CommentsBffResponse {
  return {
    status: result.success ? successStatus : (result.error.status ?? 503),
    body: result,
  };
}

function failure(
  status: number,
  fieldErrors?: Record<string, string[]>,
): CommentsBffResponse {
  const code: ApiErrorCode =
    status === 401
      ? "AUTH_SESSION_EXPIRED"
      : status === 403
        ? "AUTH_FORBIDDEN"
        : status === 400
          ? "REQUEST_BODY_INVALID"
          : "VALIDATION_FAILED";
  return {
    status,
    body: apiFailure(code, {
      status,
      ...(fieldErrors ? { fieldErrors } : {}),
    }),
  };
}

function validId(value: string): string | null {
  return /^[1-9]\d*$/.test(value) ? value : null;
}

export async function listCommentsBff(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<CommentsBffResponse> {
  if (!token) return failure(401);
  const rawSearchParams = new URL(request.url).searchParams;
  const parsed = commentsQuerySchema.safeParse(
    Object.fromEntries(rawSearchParams.entries()),
  );
  if (!parsed.success) return failure(422);
  const query = commentsQueryFromSearchParams(rawSearchParams);
  return response(
    await client.request(commentsBackendEndpoints.list, {
      query: commentsQueryToBackend(query),
      responseSchema: commentsPageSchema,
      cache: "no-store",
      ...auth(token),
    }),
  );
}

export async function getCommentBff(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<CommentsBffResponse> {
  if (!token) return failure(401);
  const commentId = validId(id);
  if (!commentId) return failure(404);
  return response(
    await client.request(commentsBackendEndpoints.detail(commentId), {
      responseSchema: commentDetailSchema,
      cache: "no-store",
      ...auth(token),
    }),
  );
}

export async function getCommentOptionsBff(
  client: ServerApiClient,
  token?: string,
): Promise<CommentsBffResponse> {
  if (!token) return failure(401);
  return response(
    await client.request(commentsBackendEndpoints.options, {
      responseSchema: commentOptionsSchema,
      cache: "no-store",
      ...auth(token),
    }),
  );
}

export async function getCommentsStatsBff(
  client: ServerApiClient,
  token?: string,
): Promise<CommentsBffResponse> {
  if (!token) return failure(401);
  return response(
    await client.request(commentsBackendEndpoints.stats, {
      responseSchema: commentsStatsSchema,
      cache: "no-store",
      ...auth(token),
    }),
  );
}

export async function approveCommentBff(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<CommentsBffResponse> {
  if (!token) return failure(401);
  const commentId = validId(id);
  if (!commentId) return failure(404);
  return response(
    await client.request(commentsBackendEndpoints.approve(commentId), {
      method: "POST",
      body: {},
      responseSchema: commentDetailSchema,
      cache: "no-store",
      ...auth(token),
    }),
  );
}

export async function deleteCommentBff(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<CommentsBffResponse> {
  if (!token) return failure(401);
  const commentId = validId(id);
  if (!commentId) return failure(404);
  return response(
    await client.request(commentsBackendEndpoints.detail(commentId), {
      method: "DELETE",
      responseSchema: commentDeleteResponseSchema,
      cache: "no-store",
      ...auth(token),
    }),
  );
}

export async function bulkDeleteCommentsBff(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<CommentsBffResponse> {
  if (!token) return failure(401);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return failure(400);
  }
  const parsed = bulkDeleteCommentsSchema.safeParse(body);
  if (!parsed.success) {
    return failure(422, {
      ids: parsed.error.issues.map((issue) => issue.message),
    });
  }
  return response(
    await client.request(commentsBackendEndpoints.bulkDelete, {
      method: "POST",
      body: parsed.data,
      responseSchema: commentDeleteResponseSchema,
      cache: "no-store",
      ...auth(token),
    }),
  );
}

export function toCommentsHttpResponse(result: CommentsBffResponse): Response {
  return Response.json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
}
