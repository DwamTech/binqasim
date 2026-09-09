"use client";

import type {
  CommentOptions,
  CommentsPage,
  CommentsQuery,
  CommentsSummary,
  ContentComment,
} from "../domain/comments.contracts";
import { commentsDashboardApiEndpoints } from "../infrastructure/comments.endpoints";
import { commentsQueryToSearchParams } from "../infrastructure/comments.query";

type Failure = {
  success: false;
  error?: {
    message?: string;
    fieldErrors?: Record<string, string[]>;
  };
};

export class CommentsClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(commentsErrorMessage(status));
    this.name = "CommentsClientError";
  }
}

export function commentsErrorMessage(status: number): string {
  if (status === 401) return "انتهت الجلسة. سجّل الدخول مرة أخرى.";
  if (status === 403) return "لا تملك صلاحية إدارة التعليقات.";
  if (status === 404) return "التعليق غير موجود أو تم حذفه.";
  if (status === 409) return "تغيّرت حالة التعليق. حدّث الصفحة ثم حاول مجددًا.";
  if (status === 422) return "بيانات العملية غير صالحة.";
  if (status === 429) return "طلبات كثيرة. انتظر قليلًا ثم حاول مجددًا.";
  if (status >= 500) return "خدمة التعليقات غير متاحة الآن.";
  return "تعذر إكمال العملية.";
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { ...options, credentials: "same-origin" });
  } catch (reason) {
    if (reason instanceof DOMException && reason.name === "AbortError")
      throw reason;
    throw new CommentsClientError(503);
  }
  const payload = (await response.json().catch(() => null)) as
    { success: true; data: T } | Failure | null;
  if (!response.ok || !payload || payload.success !== true) {
    const failure = payload as Failure | null;
    throw new CommentsClientError(response.status, failure?.error?.fieldErrors);
  }
  return payload.data;
}

export function listComments(
  query: CommentsQuery,
  signal?: AbortSignal,
): Promise<CommentsPage> {
  const params = commentsQueryToSearchParams(query);
  return request(`${commentsDashboardApiEndpoints.list}?${params}`, {
    ...(signal ? { signal } : {}),
  });
}

export function getCommentOptions(
  signal?: AbortSignal,
): Promise<CommentOptions> {
  return request(commentsDashboardApiEndpoints.options, {
    ...(signal ? { signal } : {}),
  });
}

export function getCommentsStats(
  signal?: AbortSignal,
): Promise<CommentsSummary> {
  return request(commentsDashboardApiEndpoints.stats, {
    ...(signal ? { signal } : {}),
  });
}

export function getComment(
  id: string,
  signal?: AbortSignal,
): Promise<ContentComment> {
  return request(commentsDashboardApiEndpoints.detail(id), {
    ...(signal ? { signal } : {}),
  });
}

export function approveComment(id: string | number): Promise<ContentComment> {
  return request(commentsDashboardApiEndpoints.approve(id), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
}

export function deleteComment(id: string | number): Promise<object> {
  return request(commentsDashboardApiEndpoints.detail(id), {
    method: "DELETE",
  });
}

export function bulkDeleteComments(ids: readonly number[]): Promise<object> {
  return request(commentsDashboardApiEndpoints.bulkDelete, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ids }),
  });
}
